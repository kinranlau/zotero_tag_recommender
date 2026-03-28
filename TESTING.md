# Testing Checklist for Zotero Tag Recommender

## Before Testing
- [ ] Install PowerShell 7+ if needed (`winget install Microsoft.PowerShell`)
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run build` to build the extension
- [ ] Obtain API key from OpenAI or Anthropic

## Installation Testing
- [ ] Build completes without errors
- [ ] Extension loads in Zotero 7
- [ ] No console errors on startup
- [ ] Addon appears in Tools menu

## Configuration Testing
- [ ] Preferences window opens from Tools → Tag Recommender Settings
- [ ] API Provider dropdown shows OpenAI and Anthropic options
- [ ] API Key field accepts input and masks characters
- [ ] Max Tags field accepts numbers 1-20
- [ ] Custom Prompt textarea accepts and displays text
- [ ] Preferences are saved when dialog is closed
- [ ] Preferences persist after Zotero restart

## Core Functionality Testing

### Menu Integration
- [ ] Right-click on an item shows "Suggest Tags with AI" option
- [ ] Menu item has icon
- [ ] Menu item is disabled when no items selected
- [ ] Menu item works with keyboard navigation

### Tag Generation - Happy Path
- [ ] Select a paper with title and abstract
- [ ] Right-click → "Suggest Tags with AI"
- [ ] Progress indicator shows "Generating tags..."
- [ ] Progress indicator shows "Fetching existing tags..."
- [ ] Progress indicator shows "Calling API..."
- [ ] Dialog opens with suggested tags
- [ ] Tags are displayed as checkboxes
- [ ] Tags are relevant to the paper

### Tag Selection and Application
- [ ] Can check/uncheck suggested tags
- [ ] Manual tag input field accepts text
- [ ] Can add multiple custom tags (comma-separated)
- [ ] Apply button applies selected tags
- [ ] Apply button applies custom tags
- [ ] Success message shows correct count
- [ ] Tags appear in item's tag list
- [ ] Dialog closes after applying tags

### Error Handling
- [ ] Error shown when no API key configured
- [ ] Error shown when API key is invalid
- [ ] Error shown for API network errors
- [ ] Error shown for API rate limits
- [ ] Warning shown when no items selected
- [ ] Info shown when selecting multiple items
- [ ] Handles items without abstracts gracefully
- [ ] Handles empty suggestion responses

## OpenAI Testing
- [ ] Configure OpenAI as provider
- [ ] Enter valid OpenAI API key
- [ ] Generate tags successfully
- [ ] Verify API call format in logs
- [ ] Test with different paper types
- [ ] Verify tag quality and relevance

## Anthropic Testing
- [ ] Configure Anthropic as provider
- [ ] Enter valid Anthropic API key
- [ ] Generate tags successfully
- [ ] Verify API call format in logs
- [ ] Test with different paper types
- [ ] Verify tag quality and relevance

## Custom Prompt Testing
- [ ] Modify custom prompt in preferences
- [ ] Verify {title} placeholder is replaced
- [ ] Verify {abstract} placeholder is replaced
- [ ] Verify {tags} placeholder is replaced
- [ ] Test prompt with different wording
- [ ] Verify prompt affects tag suggestions

## Edge Cases
- [ ] Item with no abstract
- [ ] Item with very long abstract (>10,000 chars)
- [ ] Item with non-English title/abstract
- [ ] Library with no existing tags
- [ ] Library with 1000+ existing tags
- [ ] Applying 0 tags (should show warning)
- [ ] Applying 20+ tags
- [ ] Tags with special characters
- [ ] Very long tag names
- [ ] Duplicate tag suggestions

## Performance Testing
- [ ] Time to fetch existing tags (should be <2s)
- [ ] Time to call API (OpenAI: <5s, Anthropic: <5s)
- [ ] Dialog responsiveness
- [ ] Memory usage is reasonable
- [ ] No memory leaks after multiple uses

## UI/UX Testing
- [ ] Dialog size is appropriate
- [ ] Dialog is centered on screen
- [ ] Dialog is resizable
- [ ] Text is readable
- [ ] Buttons are clearly labeled
- [ ] Progress messages are clear
- [ ] Error messages are helpful
- [ ] Success messages are encouraging

## Localization Testing
- [ ] All strings use localization
- [ ] No hardcoded English strings in code
- [ ] Placeholders work correctly
- [ ] Missing strings show keys (not blank)

## Security Testing
- [ ] API key is stored securely
- [ ] API key is not logged to console
- [ ] API key is masked in UI
- [ ] HTTPS is used for all API calls
- [ ] No sensitive data in error messages

## Regression Testing
- [ ] Other Zotero features still work
- [ ] No conflicts with other extensions
- [ ] Zotero performance not degraded
- [ ] No console warnings or errors

## Known Limitations
- Single item processing only (first item if multiple selected)
- Requires internet connection
- Requires valid API key
- API costs apply (user's responsibility)
- Limited to 20 tags max per request
- English prompts work best

## Build Issues to Fix
- [ ] Ensure PowerShell 7+ is available for builds
- [ ] Verify all TypeScript compiles without errors
- [ ] Check for any missing dependencies
- [ ] Validate manifest.json
- [ ] Verify locale files are packaged

## Documentation to Review
- [ ] README.md is up to date
- [ ] IMPLEMENTATION.md is accurate
- [ ] Code comments are clear
- [ ] Type definitions are correct

## Before Release
- [ ] Update version number in package.json
- [ ] Update CHANGELOG.md with changes
- [ ] Test on Windows
- [ ] Test on macOS (if available)
- [ ] Test on Linux (if available)
- [ ] Create GitHub release
- [ ] Tag commit with version
- [ ] Update documentation with examples
