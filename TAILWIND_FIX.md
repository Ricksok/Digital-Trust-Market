# Tailwind CSS Warning Fix

## Issue
VS Code shows "Unknown at rule @tailwind" warnings in `globals.css`.

## Solution Applied

### 1. VS Code Settings
Created/updated `.vscode/settings.json` at both root and frontend levels to:
- Disable CSS validation for unknown at-rules
- Configure Tailwind CSS IntelliSense
- Enable string suggestions for Tailwind classes

### 2. Stylelint Configuration
Created `frontend/.stylelintrc.json` to recognize Tailwind directives:
- `@tailwind`
- `@apply`
- `@variants`
- `@responsive`
- `@screen`

### 3. CSS Comments
Added stylelint-disable comments in `globals.css` to suppress warnings.

## VS Code Extension (Optional but Recommended)

For the best experience, install the **Tailwind CSS IntelliSense** extension:
1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "Tailwind CSS IntelliSense"
3. Install by Tailwind Labs

This will provide:
- Autocomplete for Tailwind classes
- Linting
- Hover previews
- Syntax highlighting

## Verification

The warnings should now be suppressed. If you still see them:
1. Reload VS Code window (Ctrl+Shift+P → "Reload Window")
2. Ensure the Tailwind CSS IntelliSense extension is installed
3. Check that `.vscode/settings.json` is in your workspace

## Note

These are **warnings only** and don't affect functionality. Tailwind CSS works correctly at runtime regardless of these warnings.


