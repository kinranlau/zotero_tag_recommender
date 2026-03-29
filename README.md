# Zotero Tag Recommender

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

[image]

AI-powered tag suggestions from your papers’ titles and abstracts, aligned with your existing library.

## Quick start

**You only need:**

1. The plugin `.xpi` installed in Zotero
2. An API key from OpenAI or Anthropic

**Cost-efficient model options:**

- `gpt-4o-mini` (recommended, good performance and cheapest)
- `gpt-3.5-turbo`
- `claude-haiku-4-5-20251001`

## Get started

### 1) Install the plugin

[image]

1. Download the latest `.xpi` release package.
2. In Zotero, go to `Tools` -> `Plugins`.
3. Click the gear icon, choose `Install Plugin From File...`, then select the `.xpi`.

### 2) Configure API settings

[image]

Open `Edit` -> `Settings` -> `Tag Recommender` and set:

- `API Provider` (`OpenAI` or `Anthropic`; this must match your API key)
- `Model`
- `API Key`
- optional: `Maximum Tags`
- optional: `Custom Prompt`

Default prompt behavior is optimized for:

- aligning suggestions with your established library tags
- returning a clean comma-separated output

### 3) Generate and apply tags

[image]

1. Right-click an item and choose `Suggest Tags with AI`.
2. Click suggested tags to toggle selection.
3. You can also type additional tags (comma-separated), e.g. surface chemistry, in-situ, PCET.
4. Click `Apply Tags` to add the selected tags and the manually typed tags.

## Tips for better results

- Keep your library tags clean and consistent; suggestions use that vocabulary.
- Include both title and abstract when possible; titles alone work, but results improve with abstracts.
- Customize the prompt to fit your field and tagging style.
- For budget-friendly usage, `gpt-4o-mini` is a strong default.

## Troubleshooting

- **No suggestions returned**
  - Check API key, model name, and provider selection.
  - Try a different model in the dropdown.
- **API errors (400/404)**
  - Model availability can vary by account/provider.
  - Use currently supported models listed in plugin settings.

## Acknowledgements

- Built on [zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template)
- Developed by Kinran Lau with AI assistance from:
  - GPT-5.3-Codex
  - Claude Sonnet 4.5

## For contributors

```bash
npm install
npm run build
```
