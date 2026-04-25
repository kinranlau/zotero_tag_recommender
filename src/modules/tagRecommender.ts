import { config } from "../../package.json";

export class TagRecommenderFactory {
  private static readonly TAG_SYSTEM_PROMPT =
    "You are a helpful assistant that suggests relevant tags for academic papers. Return only the tags as a comma-separated list, nothing else.";

  /**
   * Get the most frequent existing tags in the library
   */
  static async getExistingTags(): Promise<string[]> {
    const libraryID = Zotero.Libraries.userLibraryID;
    const tags = await Zotero.Tags.getAll(libraryID);
    const tagsWithIDs = tags
      .map((tag) => {
        const tagName = tag.tag.trim();
        const tagID = Zotero.Tags.getID(tagName);
        return {
          tag: tagName,
          tagID: typeof tagID === "number" ? tagID : null,
        };
      })
      .filter((entry) => entry.tag && entry.tagID !== null);

    const tagUsage = await Promise.all(
      tagsWithIDs.map(async ({ tag, tagID }) => {
        const itemIDs = await Zotero.Tags.getTagItems(libraryID, tagID!);
        return { tag, count: itemIDs.length };
      }),
    );

    return tagUsage
      .sort((a, b) => b.count - a.count)
      .slice(0, 100)
      .map((entry) => entry.tag);
  }

  /**
   * Get all unique tags in the library for custom-tag autocomplete
   */
  static async getAllLibraryTags(): Promise<string[]> {
    const libraryID = Zotero.Libraries.userLibraryID;
    const tags = await Zotero.Tags.getAll(libraryID);
    const uniqueTags = new Set(
      tags.map((tag) => tag.tag.trim()).filter((tag) => tag.length > 0),
    );
    return Array.from(uniqueTags);
  }

  /**
   * Get title and abstract for an item
   */
  static getItemMetadata(item: Zotero.Item): {
    title: string;
    abstract: string;
    creators: string;
  } {
    const title = (item.getField("title") as string) || "";
    const abstract = (item.getField("abstractNote") as string) || "";
    const creators = item
      .getCreators()
      .map((c) => `${c.firstName || ""} ${c.lastName || ""}`.trim())
      .join(", ");

    return { title, abstract, creators };
  }

  /**
   * Call LLM API to get tag suggestions
   */
  static async getSuggestedTags(
    title: string,
    abstract: string,
    existingTags: string[],
  ): Promise<string[]> {
    const apiKey = Zotero.Prefs.get(
      `${config.prefsPrefix}.apiKey`,
      true,
    ) as string;
    const apiProvider = Zotero.Prefs.get(
      `${config.prefsPrefix}.apiProvider`,
      true,
    ) as string;
    const apiModel = Zotero.Prefs.get(
      `${config.prefsPrefix}.apiModel`,
      true,
    ) as string;
    const customPrompt = Zotero.Prefs.get(
      `${config.prefsPrefix}.customPrompt`,
      true,
    ) as string;
    const maxTags = Zotero.Prefs.get(
      `${config.prefsPrefix}.maxTags`,
      true,
    ) as number;

    ztoolkit.log("Tag Recommender - Starting tag generation");
    ztoolkit.log("Provider:", apiProvider);
    ztoolkit.log("Model:", apiModel);
    ztoolkit.log("Max tags:", maxTags);

    if (!apiKey || apiKey.trim() === "") {
      throw new Error("API key not configured. Please set it in preferences.");
    }

    // Build the prompt
    const tagsString = existingTags.join(", ");
    const prompt = customPrompt
      .replace("{title}", title)
      .replace("{abstract}", abstract || "No abstract available")
      .replace("{tags}", tagsString || "No existing tags");

    ztoolkit.log("Generated prompt:", prompt.substring(0, 200) + "...");
    ztoolkit.log("Top library tags count sent:", existingTags.length);

    let suggestions: string[] = [];

    try {
      if (apiProvider === "openai") {
        suggestions = await this.callOpenAI(apiKey, prompt, maxTags, apiModel);
      } else if (apiProvider === "anthropic") {
        suggestions = await this.callAnthropic(
          apiKey,
          prompt,
          maxTags,
          apiModel,
        );
      } else if (apiProvider === "google") {
        suggestions = await this.callGemini(apiKey, prompt, maxTags, apiModel);
      } else if (apiProvider === "deepseek") {
        suggestions = await this.callDeepSeek(
          apiKey,
          prompt,
          maxTags,
          apiModel,
        );
      } else {
        throw new Error(`Unsupported API provider: ${apiProvider}`);
      }

      ztoolkit.log("Received suggestions:", suggestions);
    } catch (error: any) {
      ztoolkit.log("Error calling API:", error);
      throw error;
    }

    return suggestions;
  }

  /**
   * Call OpenAI API
   */
  private static async callOpenAI(
    apiKey: string,
    prompt: string,
    maxTags: number,
    model: string,
  ): Promise<string[]> {
    const resolvedModel = model?.trim();
    if (!resolvedModel) {
      throw new Error("API model is not configured. Please select a model.");
    }
    ztoolkit.log("Calling OpenAI with model:", resolvedModel);

    const requestBody: any = {
      model: resolvedModel,
      messages: [
        {
          role: "system",
          content: this.TAG_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };
    requestBody.temperature = 0.7;
    requestBody.max_tokens = 150;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      ztoolkit.log("OpenAI API error response:", error);
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    ztoolkit.log("OpenAI API response:", data);
    const content = (data as any).choices?.[0]?.message?.content || "";
    return this.parseTags(content, maxTags);
  }

  /**
   * Call Anthropic API
   */
  private static async callAnthropic(
    apiKey: string,
    prompt: string,
    maxTags: number,
    model: string,
  ): Promise<string[]> {
    const resolvedModel = model?.trim();
    if (!resolvedModel) {
      throw new Error("API model is not configured. Please select a model.");
    }
    ztoolkit.log("Calling Anthropic with model:", resolvedModel);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: resolvedModel,
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `${this.TAG_SYSTEM_PROMPT}\n\n${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      ztoolkit.log("Anthropic API error response:", error);
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    ztoolkit.log("Anthropic API response:", data);
    const content = (data as any).content?.[0]?.text || "";
    return this.parseTags(content, maxTags);
  }

  /**
   * Call Google Gemini API
   */
  private static async callGemini(
    apiKey: string,
    prompt: string,
    maxTags: number,
    model: string,
  ): Promise<string[]> {
    const resolvedModel = model?.trim();
    if (!resolvedModel) {
      throw new Error("API model is not configured. Please select a model.");
    }
    ztoolkit.log("Calling Gemini with model:", resolvedModel);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(resolvedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: this.TAG_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      ztoolkit.log("Gemini API error response:", error);
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    ztoolkit.log("Gemini API response:", data);
    const content = ((data as any).candidates?.[0]?.content?.parts || [])
      .map((part: any) => part?.text || "")
      .join(" ")
      .trim();
    return this.parseTags(content, maxTags);
  }

  /**
   * Call DeepSeek API
   */
  private static async callDeepSeek(
    apiKey: string,
    prompt: string,
    maxTags: number,
    model: string,
  ): Promise<string[]> {
    const resolvedModel = model?.trim();
    if (!resolvedModel) {
      throw new Error("API model is not configured. Please select a model.");
    }
    ztoolkit.log("Calling DeepSeek with model:", resolvedModel);

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [
          {
            role: "system",
            content: this.TAG_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      ztoolkit.log("DeepSeek API error response:", error);
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    ztoolkit.log("DeepSeek API response:", data);
    const content = (data as any).choices?.[0]?.message?.content || "";
    return this.parseTags(content, maxTags);
  }

  /**
   * Parse tags from LLM response
   */
  private static parseTags(content: string, maxTags: number): string[] {
    const tags = content
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length < 100)
      .slice(0, maxTags);
    return tags;
  }

  /**
   * Apply selected tags to an item
   */
  static async applyTags(item: Zotero.Item, tags: string[]): Promise<void> {
    for (const tag of tags) {
      item.addTag(tag);
    }
    await item.saveTx();
  }
}
