# Zotero Tag Recommender - Implementation Complete

## Overview
A Zotero extension that uses AI (OpenAI GPT or Anthropic Claude) to suggest relevant tags for academic papers based on:
- Paper title and abstract
- Existing tags in your Zotero library
- Customizable prompts for personalized tag generation

## Features Implemented

### ✅ Core Functionality
1. **AI-Powered Tag Suggestions**
   - Integration with OpenAI (GPT-3.5-turbo) and Anthropic (Claude-3-haiku)
   - Extracts paper metadata (title, abstract, creators)
   - Analyzes existing library tags for context
   - Generates relevant tag suggestions

2. **User Interface**
   - Right-click context menu item "Suggest Tags with AI"
   - Interactive dialog showing suggested tags
   - Checkbox selection for suggested tags
   - Manual tag input field for custom tags
   - Real-time progress indicators

3. **Configuration**
   - Settings accessible via Zotero preferences
   - API provider selection (OpenAI/Anthropic)
   - Secure API key storage
   - Customizable prompt templates with placeholders
   - Adjustable maximum number of tags

### 📁 Files Created/Modified

#### New Files:
- `src/modules/tagRecommender.ts` - Core AI integration logic
- `src/modules/tagDialog.ts` - User interface dialog
- `addon/locale/en-US/tagDialog.ftl` - Dialog localization strings

#### Modified Files:
- `package.json` - Updated addon name, ID, and metadata
- `addon/prefs.js` - Added preferences for API settings
- `addon/content/preferences.xhtml` - Created settings UI
- `src/modules/preferenceScript.ts` - Simplified preference handling
- `src/modules/examples.ts` - Added tag recommender menu integration
- `src/hooks.ts` - Simplified and integrated tag recommender
- `src/utils/locale.ts` - Added tagDialog.ftl to locale loading
- `addon/locale/en-US/addon.ftl` - Updated menu labels
- `addon/locale/en-US/preferences.ftl` - Added settings labels
- `addon/locale/en-US/mainWindow.ftl` - Cleaned up

## How to Use

### Setup:
1. Install the extension in Zotero
2. Go to Tools → Tag Recommender Settings
3. Select your API provider (OpenAI or Anthropic)
4. Enter your API key
5. (Optional) Customize the prompt template and max tags

### Usage:
1. Select a paper in your Zotero library
2. Right-click → "Suggest Tags with AI"
3. Wait for AI to generate suggestions
4. Select tags you want to apply (checkboxes)
5. Optionally add custom tags in the input field
6. Click "Apply Tags"

## Configuration Options

### API Provider
- **OpenAI**: Uses GPT-3.5-turbo model
- **Anthropic**: Uses Claude-3-haiku model

### Custom Prompt Template
Use placeholders in your prompt:
- `{title}` - Paper title
- `{abstract}` - Paper abstract
- `{tags}` - Existing library tags (comma-separated)

Default prompt:
```
Based on the following paper details and existing tags in the library, 
suggest 5-10 relevant tags that would help categorize this paper. 
Be concise and specific.

Title: {title}
Abstract: {abstract}
Existing library tags: {tags}

Suggest tags (comma-separated):
```

### Maximum Tags
Set the maximum number of tags the AI should suggest (1-20).

## Technical Implementation

### Architecture:
```
TagRecommender Module
├── getExistingTags() - Queries Zotero database
├── getItemMetadata() - Extracts paper info
├── getSuggestedTags() - Coordinates AI API call
├── callOpenAI() - OpenAI API integration
├── callAnthropic() - Anthropic API integration
├── parseTags() - Formats AI response
└── applyTags() - Saves tags to Zotero item

TagDialog Module
├── showTagDialog() - Main entry point
└── showSelectionDialog() - Interactive UI
```

### API Integration:
- **OpenAI**: `https://api.openai.com/v1/chat/completions`
  - Model: gpt-3.5-turbo
  - Temperature: 0.7
  - Max tokens: 150

- **Anthropic**: `https://api.anthropic.com/v1/messages`
  - Model: claude-3-haiku-20240307
  - Max tokens: 150

### Error Handling:
- Checks for API key before making requests
- Validates API responses
- Shows user-friendly error messages
- Logs errors for debugging

## Building the Extension

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Run in development mode with auto-reload
npm start
```

The built extension will be in `.scaffold/build/` directory.

## Privacy & Security

- API keys are stored locally in Zotero preferences
- No data is sent to third parties except your chosen AI provider
- All communication uses HTTPS
- API keys are displayed as password fields in settings

## Future Enhancements

Potential improvements:
- Support for additional AI providers
- Batch processing for multiple items
- Tag confidence scores
- Tag deduplication logic
- Multi-language support
- Advanced filtering options
- Tag analytics and insights

## Requirements

- Zotero 7.x or later
- Node.js for building
- API key from OpenAI or Anthropic

## License

AGPL-3.0-or-later (inherited from template)

## Credits

Built on the [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) by windingwind.
