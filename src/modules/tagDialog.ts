import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { TagRecommenderFactory } from "./tagRecommender";

export class TagDialogFactory {
  /**
   * Show tag suggestion dialog for selected items
   */
  static async showTagDialog(): Promise<void> {
    const win = Zotero.getMainWindow();
    if (!win || !win.ZoteroPane) {
      return;
    }
    const items = win.ZoteroPane.getSelectedItems();

    if (!items || items.length === 0) {
      new ztoolkit.ProgressWindow(config.addonName)
        .createLine({
          text: getString("dialog-no-items-selected"),
          type: "error",
        })
        .show(-1);
      return;
    }

    if (items.length > 1) {
      new ztoolkit.ProgressWindow(config.addonName)
        .createLine({
          text: getString("dialog-multiple-items-warning"),
          type: "default",
        })
        .show(-1);
    }

    const item = items[0];

    // Show progress
    const progressWin = new ztoolkit.ProgressWindow(config.addonName, {
      closeOnClick: false,
    })
      .createLine({
        text: getString("dialog-generating-tags"),
        type: "default",
        progress: 0,
      })
      .show();

    try {
      // Get item metadata
      const { title, abstract } = TagRecommenderFactory.getItemMetadata(item);

      progressWin.changeLine({
        text: getString("dialog-fetching-existing-tags"),
        progress: 30,
      });

      // Get existing tags
      const existingTags = await TagRecommenderFactory.getExistingTags();
      const allLibraryTags = await TagRecommenderFactory.getAllLibraryTags();

      progressWin.changeLine({
        text: getString("dialog-calling-api"),
        progress: 50,
      });

      // Get suggestions
      const suggestedTags = await TagRecommenderFactory.getSuggestedTags(
        title,
        abstract,
        existingTags,
      );

      progressWin.close();

      // Show dialog with suggestions
      await this.showSelectionDialog(item, suggestedTags, allLibraryTags);
    } catch (error: any) {
      progressWin.close();
      new ztoolkit.ProgressWindow(config.addonName)
        .createLine({
          text: `${getString("dialog-error")}: ${error.message}`,
          type: "error",
        })
        .show(-1);
      ztoolkit.log("Error generating tags:", error);
    }
  }

  /**
   * Show dialog for tag selection and manual input
   */
  private static async showSelectionDialog(
    item: Zotero.Item,
    suggestedTags: string[],
    libraryTags: string[],
  ): Promise<void> {
    const selectedTags = new Set<string>();
    const customSelectedTags = new Set<string>();

    const dialogData: { [key: string | number]: any } = {
      loadCallback: () => {
        const win = dialog.window;
        if (!win) {
          return;
        }

        const doc = win.document;
        const tagButtons = doc.querySelectorAll<HTMLButtonElement>(
          "#suggested-tags-container button[data-tag]",
        );
        const manualInput = doc.getElementById(
          "manual-tag-input",
        ) as HTMLInputElement | null;
        const customSelectedTagsContainer = doc.getElementById(
          "custom-selected-tags-container",
        ) as HTMLElement | null;
        const autocompleteContainer = doc.getElementById(
          "custom-tag-autocomplete",
        ) as HTMLElement | null;
        let debounceTimer: number | undefined;

        const updateTagButtonStyle = (
          btn: HTMLButtonElement,
          isSelected: boolean,
        ) => {
          btn.setAttribute("data-selected", isSelected ? "true" : "false");
          btn.style.background = isSelected
            ? "#0066cc"
            : "rgba(0, 102, 204, 0.15)";
          btn.style.borderColor = "#0066cc";
          btn.style.fontWeight = isSelected ? "500" : "normal";
        };

        const renderCustomSelectedTags = () => {
          if (!customSelectedTagsContainer) {
            return;
          }
          customSelectedTagsContainer.innerHTML = "";
          customSelectedTags.forEach((tag) => {
            const chip = doc.createElement("button");
            chip.type = "button";
            chip.textContent = tag;
            chip.style.padding = "6px 14px";
            chip.style.borderRadius = "16px";
            chip.style.border = "1px solid #0066cc";
            chip.style.background = "#0066cc";
            chip.style.color = "var(--fill-primary, #fff)";
            chip.style.cursor = "pointer";
            chip.style.fontSize = "13px";
            chip.style.fontWeight = "500";
            chip.title = "Click to remove";
            chip.addEventListener("click", () => {
              customSelectedTags.delete(tag);
              renderCustomSelectedTags();
              updateAutocompleteSuggestions();
            });
            customSelectedTagsContainer.appendChild(chip);
          });
        };

        const findPrefixMatches = (rawQuery: string): string[] => {
          const query = rawQuery.trim().toLowerCase();
          if (!query) {
            return [];
          }
          return libraryTags
            .filter((tag) => {
              if (
                !tag ||
                selectedTags.has(tag) ||
                customSelectedTags.has(tag)
              ) {
                return false;
              }
              const words = tag.toLowerCase().match(/[a-z0-9]+/g) || [];
              return words.some((word) => word.startsWith(query));
            })
            .slice(0, 8);
        };

        const renderAutocomplete = (matches: string[]) => {
          if (!autocompleteContainer || !manualInput) {
            return;
          }
          autocompleteContainer.innerHTML = "";
          if (matches.length === 0) {
            autocompleteContainer.style.display = "none";
            return;
          }
          matches.forEach((tag) => {
            const option = doc.createElement("button");
            option.type = "button";
            option.textContent = tag;
            option.style.display = "block";
            option.style.width = "100%";
            option.style.padding = "8px 10px";
            option.style.border = "none";
            option.style.background = "transparent";
            option.style.color = "var(--fill-primary, #fff)";
            option.style.textAlign = "left";
            option.style.cursor = "pointer";
            option.style.fontSize = "13px";
            option.addEventListener("mouseenter", () => {
              option.style.background = "rgba(0, 102, 204, 0.15)";
            });
            option.addEventListener("mouseleave", () => {
              option.style.background = "transparent";
            });
            option.addEventListener("mousedown", (event) => {
              event.preventDefault();
            });
            option.addEventListener("click", () => {
              customSelectedTags.add(tag);
              renderCustomSelectedTags();
              manualInput.value = "";
              renderAutocomplete([]);
              manualInput.focus();
            });
            autocompleteContainer.appendChild(option);
          });
          autocompleteContainer.style.display = "block";
        };

        const updateAutocompleteSuggestions = () => {
          if (!manualInput) {
            return;
          }
          const matches = findPrefixMatches(manualInput.value);
          renderAutocomplete(matches);
        };

        const commitCompletedInputTags = () => {
          if (!manualInput) {
            return;
          }
          const segments = manualInput.value.split(",");
          if (segments.length <= 1) {
            return;
          }
          const completedSegments = segments.slice(0, -1);
          completedSegments
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0)
            .forEach((segment) => customSelectedTags.add(segment));
          manualInput.value = segments[segments.length - 1].trimStart();
          renderCustomSelectedTags();
        };

        tagButtons.forEach((btn: HTMLButtonElement) => {
          const tag = (btn.getAttribute("data-tag") || "").trim();
          if (!tag) {
            return;
          }

          updateTagButtonStyle(btn, false);
          btn.addEventListener("click", (event: MouseEvent) => {
            event.preventDefault();
            const isSelected = selectedTags.has(tag);
            if (isSelected) {
              selectedTags.delete(tag);
            } else {
              selectedTags.add(tag);
            }
            updateTagButtonStyle(btn, !isSelected);
            updateAutocompleteSuggestions();
          });

          btn.addEventListener("mouseenter", () => {
            if (!selectedTags.has(tag)) {
              btn.style.background = "rgba(0, 102, 204, 0.3)";
            }
          });
          btn.addEventListener("mouseleave", () => {
            if (!selectedTags.has(tag)) {
              btn.style.background = "rgba(0, 102, 204, 0.15)";
            }
          });
        });

        if (manualInput) {
          manualInput.addEventListener("input", () => {
            commitCompletedInputTags();
            if (debounceTimer !== undefined) {
              win.clearTimeout(debounceTimer);
            }
            debounceTimer = win.setTimeout(() => {
              updateAutocompleteSuggestions();
            }, 220);
          });

          manualInput.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key !== "Enter") {
              return;
            }
            event.preventDefault();
            const tag = manualInput.value.trim();
            if (!tag) {
              return;
            }
            customSelectedTags.add(tag);
            manualInput.value = "";
            renderCustomSelectedTags();
            renderAutocomplete([]);
          });

          manualInput.addEventListener("focus", () => {
            updateAutocompleteSuggestions();
          });

          manualInput.addEventListener("blur", () => {
            win.setTimeout(() => {
              renderAutocomplete([]);
            }, 120);
          });
        }
      },
    };

    const dialog = new ztoolkit.Dialog(1, 1)
      .setDialogData(dialogData)
      .addCell(0, 0, {
        tag: "div",
        namespace: "html",
        attributes: {
          style:
            "padding: 20px; width: 540px; max-height: 420px; overflow-y: auto; overflow-x: hidden; box-sizing: border-box;",
        },
        children: [
          {
            tag: "h3",
            namespace: "html",
            properties: {
              innerText: getString("dialog-title"),
            },
            attributes: {
              style: "margin: 0 0 16px 0; color: var(--fill-primary, #fff);",
            },
          },
          // Suggested tags as clickable buttons
          {
            tag: "div",
            namespace: "html",
            attributes: {
              style: "margin-bottom: 20px;",
            },
            children: [
              {
                tag: "div",
                namespace: "html",
                id: "suggested-tags-container",
                attributes: {
                  style:
                    "display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; background: var(--material-background, #fff); border: 1px solid var(--fill-quinary, #555); border-radius: 4px; max-height: 200px; overflow-y: auto;",
                },
                children:
                  suggestedTags.length > 0
                    ? suggestedTags.map((tag, index) => ({
                        tag: "button",
                        namespace: "html",
                        id: `tag-btn-${index}`,
                        attributes: {
                          type: "button",
                          "data-tag": tag,
                          "data-selected": "false",
                          style:
                            "padding: 6px 14px; border-radius: 16px; border: 1px solid #0066cc; background: rgba(0, 102, 204, 0.15); color: var(--fill-primary, #fff); cursor: pointer; font-size: 13px; transition: all 0.15s ease;",
                        },
                        properties: {
                          textContent: tag,
                        },
                      }))
                    : [
                        {
                          tag: "div",
                          namespace: "html",
                          attributes: {
                            style:
                              "padding: 20px; text-align: center; font-style: italic; color: var(--fill-secondary, #888); width: 100%;",
                          },
                          properties: {
                            textContent: getString("dialog-no-suggestions"),
                          },
                        },
                      ],
              },
            ],
          },
          {
            tag: "div",
            namespace: "html",
            attributes: {
              style:
                "border-top: 1px solid var(--fill-quinary, #555); padding-top: 16px;",
            },
            children: [
              {
                tag: "h4",
                namespace: "html",
                properties: {
                  innerText: getString("dialog-manual-input"),
                },
                attributes: {
                  style:
                    "margin: 0 0 8px 0; color: var(--fill-primary, #fff); font-size: 14px;",
                },
              },
              {
                tag: "label",
                namespace: "html",
                properties: {
                  innerText: getString("dialog-add-custom-tag"),
                },
                attributes: {
                  style:
                    "display: block; margin-bottom: 6px; color: var(--fill-secondary, #999); font-size: 13px;",
                },
              },
              {
                tag: "div",
                namespace: "html",
                attributes: {
                  style:
                    "position: relative; width: 100%; box-sizing: border-box;",
                },
                children: [
                  {
                    tag: "input",
                    namespace: "html",
                    id: "manual-tag-input",
                    attributes: {
                      type: "text",
                      placeholder: getString("dialog-tag-placeholder"),
                      style:
                        "width: 100%; padding: 8px 12px; box-sizing: border-box; background: var(--material-background, #fff); color: var(--fill-primary, #fff); border: 1px solid var(--fill-quinary, #555); border-radius: 4px; font-size: 13px;",
                    },
                  },
                  {
                    tag: "div",
                    namespace: "html",
                    id: "custom-tag-autocomplete",
                    attributes: {
                      style:
                        "display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; max-height: 180px; overflow-y: auto; background: var(--material-background, #fff); border: 1px solid var(--fill-quinary, #555); border-radius: 4px; z-index: 20; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);",
                    },
                  },
                ],
              },
              {
                tag: "div",
                namespace: "html",
                id: "custom-selected-tags-container",
                attributes: {
                  style:
                    "display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;",
                },
              },
            ],
          },
        ],
      })
      .addButton(getString("dialog-apply-button"), "apply", {
        callback: async (e) => {
          try {
            // Collect manual tags and merge with selected suggested tags
            const win = dialog.window;
            if (win) {
              const doc = win.document;
              const manualInput = doc.getElementById(
                "manual-tag-input",
              ) as HTMLInputElement | null;
              const manualTag = manualInput?.value.trim();
              if (manualTag) {
                const manualTags = manualTag
                  .split(",")
                  .map((t) => t.trim())
                  .filter((t) => t);
                manualTags.forEach((t) => customSelectedTags.add(t));
              }
            }

            const tagsToApply: string[] = Array.from(
              new Set([...selectedTags, ...customSelectedTags]),
            );
            ztoolkit.log("Applying tags:", tagsToApply);

            if (tagsToApply.length === 0) {
              new ztoolkit.ProgressWindow(config.addonName)
                .createLine({
                  text: getString("dialog-no-tags-selected"),
                  type: "default",
                })
                .show(-1);
              return;
            }

            await TagRecommenderFactory.applyTags(item, tagsToApply);

            new ztoolkit.ProgressWindow(config.addonName)
              .createLine({
                text: getString("dialog-tags-applied", {
                  args: { count: tagsToApply.length },
                }),
                type: "success",
              })
              .show(-1);

            ztoolkit.log(`Applied ${tagsToApply.length} tags successfully`);
          } catch (error: any) {
            ztoolkit.log("Error:", error);
            new ztoolkit.ProgressWindow(config.addonName)
              .createLine({
                text: `Error: ${error.message}`,
                type: "error",
              })
              .show(-1);
          }
        },
      })
      .addButton(getString("dialog-cancel-button"), "cancel")
      .open(getString("dialog-window-title"), {
        width: 560,
        height: 520,
        centerscreen: true,
        resizable: false,
      });

    await dialogData.unloadLock?.promise;
  }
}
