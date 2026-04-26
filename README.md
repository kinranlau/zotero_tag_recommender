# Zotero Tag Recommender

[![zotero target version](https://img.shields.io/badge/Zotero-9-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

An AI-powered Zotero plugin that suggests tags from a paper’s title and abstract, aligned with your existing tag vocabulary.

Also includes smart tag autocompletion with multi-word matching, so you can find tags using any part of their name _(e.g. “gas” or “GDE" will match “gas diffusion electrode (GDE)”)_.

<img src="demo/demo.gif">

## Quick start

**You only need:**

1. The plugin `.xpi` installed in Zotero [(Latest Release)](https://github.com/kinranlau/zotero_tag_recommender/releases)
2. An API key from [OpenAI](https://platform.openai.com/), [Anthropic](https://platform.claude.com/), [Google](https://aistudio.google.com/), or [DeepSeek](https://platform.deepseek.com/)

_NB: API key only required for AI tag suggestions, not needed for tag autocompletion_

More details in my Medium article: [Zotero Tag Recommender: Using AI to Suggest Tags for Your Papers](https://medium.com/@kinran_lau/zotero-tag-recommender-using-ai-to-suggest-tags-for-your-papers-a850a0b933ac)

**Cost-efficient model options:**

- `gpt-4o-mini` (recommended, cheap and good performance)
- `gpt-3.5-turbo`
- `claude-haiku-4-5-20251001`
- `gemini-3.1-flash-lite-preview` (up to 500 free requests/day; data may be used by Google in free tier)
- `gemini-2.5-flash-lite`
- `deepseek-v4-flash`

## Get started

### 1) Install the plugin

<img src="demo/1_install_plugin.png" width="600">

1. [Download the latest `.xpi` release package.](https://github.com/kinranlau/zotero_tag_recommender/releases)
2. In Zotero, go to `Tools` -> `Plugins`.
3. Click the gear icon, choose `Install Plugin From File...`, then select the `.xpi`.

### 2) Configure API settings

<img src="demo/2_api_settings.png" width="600">

Open `Edit` -> `Settings` -> `Tag Recommender` and set:

- `Enable AI tag recommendations`: enabled by default; disable if you only want tag autocompletion
- `API Provider` (`OpenAI`, `Anthropic`, `Google`, or `DeepSeek`; this must match your API key)
- `Model`
- `API Key`
- optional: `Maximum Tags`
- optional: `Custom Prompt`

Default prompt behavior is optimized for:

- aligning suggestions with your established library tags
- returning a clean comma-separated output

### 3) Generate and apply tags

<img src="demo/3_generate_tags.png" width="600">

1. Right-click an item and select `Suggest Tags with AI`.
2. Choose the suggested tags you want to add.
3. Start typing in the custom tag field to see autocomplete suggestions from your library tags.
4. Click `Apply Tags` to add all selected tags.

_NB: Autocompletion uses case-insensitive multi-word prefix matching (e.g. typing “gas” or “gde” will match “gas diffusion electrode (GDE)”)._

## Tips for better results

- Keep your library tags clean and consistent; suggestions use that vocabulary.
- Include both title and abstract when possible; titles alone work, but results improve with abstracts.
- Customize the prompt to fit your field and tagging style.
- For budget-friendly usage, `gpt-4o-mini` is a strong default.

## Acknowledgements

- Built on [zotero-plugin-template](https://github.com/windingwind/zotero-plugin-template)
- Developed by Kinran Lau with AI assistance from:
  - GPT-5.3-Codex
  - Claude Sonnet 4.5
