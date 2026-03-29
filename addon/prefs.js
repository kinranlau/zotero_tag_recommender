pref("apiKey", "");
pref("apiProvider", "openai");
pref("apiModel", "gpt-4o-mini");
pref(
  "customPrompt",
  "You are an expert research librarian organizing a Zotero library. Suggest 10-20 high-quality tags using the paper metadata and existing library vocabulary.\n\nTitle: {title}\nAbstract: {abstract}\nExisting library tags: {tags}\n\nRules:\n- Prioritize reuse/adaptation of existing library tags and preferred wording.\n- Include a balanced mix: core topic tags, conceptual/mechanistic tags, and application/context tags.\n- Be specific but avoid unnecessary micro-detail.\n- Prefer lowercase tags unless a term is a standard abbreviation or proper noun.\n- Normalize casing/spelling/format; avoid duplicates and near-duplicates.\n- If abstract is missing, infer from title and lean more on existing tags.\n- Include 2-4 useful bridging tags that connect related areas.\n- Exclude low-value generic tags (e.g., study, paper, experiment).\n\nOutput only a comma-separated list. No explanations.",
);
pref("maxTags", 15);
