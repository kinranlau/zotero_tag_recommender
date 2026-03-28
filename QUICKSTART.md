# Quick Start Guide - Zotero Tag Recommender

## 🚀 Setup (First Time)

### 1. Install Dependencies
```bash
npm install
```

### 2. Get an API Key

**Option A: OpenAI**
1. Go to https://platform.openai.com/api-keys
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

**Option B: Anthropic (Claude)**
1. Go to https://console.anthropic.com/settings/keys
2. Create an account or sign in
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-`)

### 3. Build the Extension
```bash
npm run build
```

This creates the extension in `.scaffold/build/` folder.

### 4. Install in Zotero
1. Open Zotero 7
2. Go to Tools → Plugins
3. Click the gear icon → "Install Add-on From File"
4. Navigate to `.scaffold/build/` and select the `.xpi` file
5. Restart Zotero

### 5. Configure Settings
1. Go to Edit → Settings (or Zotero → Settings on Mac)
2. Find "Tag Recommender" in the left sidebar
3. Select API Provider (OpenAI or Anthropic)
4. Paste your API key
5. (Optional) Adjust max tags and custom prompt
6. Close the settings

## 🏷️ Using the Extension

### Basic Usage
1. **Select a paper** in your Zotero library
2. **Right-click** on the paper
3. Click **"Suggest Tags with AI"**
4. Wait for suggestions (usually 5-10 seconds)
5. **Check the tags** you want to apply
6. (Optional) Add custom tags in the input field
7. Click **"Apply Tags"**

### Tips for Best Results
- Papers with abstracts get better suggestions
- The more tags in your library, the more context for AI
- Customize the prompt to match your tagging style
- Start with 5-10 max tags, adjust based on results

## 🎨 Customizing the Prompt

The prompt template uses these placeholders:
- `{title}` - Replaced with paper title
- `{abstract}` - Replaced with paper abstract
- `{tags}` - Replaced with existing library tags

### Example Custom Prompts

**Academic Focus:**
```
Analyze this academic paper and suggest precise, discipline-specific tags:

Title: {title}
Abstract: {abstract}
Existing tags: {tags}

Provide 5-8 tags that indicate:
- Research methodology
- Key concepts
- Academic field
- Publication type
```

**Topic-Based:**
```
Based on this paper, suggest topic-oriented tags:

Title: {title}
Abstract: {abstract}

Consider these existing tags for consistency: {tags}

Suggest 5-10 tags focusing on main topics and themes.
```

**Short and Simple:**
```
Paper: {title}
Summary: {abstract}
Tags in library: {tags}

Suggest 5 relevant tags.
```

## ⚙️ Development Mode

For active development with auto-reload:
```bash
npm start
```

This watches for changes and automatically rebuilds and reloads in Zotero.

## 🐛 Troubleshooting

### "API key not configured"
- Go to settings and enter your API key
- Make sure it's the correct format (sk-... for OpenAI, sk-ant-... for Anthropic)

### "API error: 401"
- Your API key is invalid or expired
- Generate a new key and update settings

### "API error: 429"
- You've hit the rate limit
- Wait a few minutes and try again
- Check your API usage on the provider's dashboard

### No suggestions generated
- Check that the paper has a title
- Verify API key is correct
- Check internet connection
- Look at Zotero console (Tools → Developer → Error Console)

### Extension not appearing
- Make sure you installed the .xpi file
- Restart Zotero completely
- Check Tools → Plugins to verify installation

## 💡 Best Practices

1. **Start Small**: Test with a few papers first
2. **Review Suggestions**: Don't blindly accept all tags
3. **Iterate on Prompt**: Adjust the prompt template to improve results
4. **Monitor Costs**: API calls cost money (usually <$0.01 per paper)
5. **Build a Tag System**: Use the extension to maintain consistent tagging
6. **Combine with Manual Tags**: Use AI suggestions as a starting point

## 📊 Cost Estimates

**OpenAI (GPT-3.5-turbo)**
- ~$0.0015 per 1,000 tokens
- Typical paper: 500-1000 tokens
- Cost per paper: ~$0.001-0.002 (0.1-0.2 cents)

**Anthropic (Claude-3-haiku)**
- ~$0.00025 per 1,000 input tokens
- Similar token usage to OpenAI
- Cost per paper: ~$0.0002-0.0005

**For 1,000 papers:**
- OpenAI: ~$1-2
- Anthropic: ~$0.25-0.50

## 🔒 Privacy Note

- Your API key is stored locally in Zotero
- Paper metadata is sent to your chosen AI provider
- No data is stored or logged by this extension
- Review your AI provider's privacy policy

## 📚 Example Workflow

1. **Import papers** into Zotero (via browser connector, DOI, PDF)
2. **Batch process**: Select a paper → suggest tags → apply → repeat
3. **Review**: Check the applied tags, adjust if needed
4. **Search**: Use Zotero's tag filter to find related papers
5. **Refine**: Update custom prompt based on tag quality

## 🆘 Getting Help

- Check `TESTING.md` for detailed test cases
- Check `IMPLEMENTATION.md` for technical details
- Review Zotero Error Console for error messages
- Check API provider's status page for outages

## 🎓 Learning Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Zotero Plugin Development](https://www.zotero.org/support/dev/client_coding)
