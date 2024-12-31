# PR Input Form Manual Tests

This document outlines manual test cases for the PR Input Form component, which handles GitHub Pull Request URL validation and submission.

## Test Cases

### 1. Empty URL Submission
**Steps:**
1. Navigate to the PR input form
2. Leave the URL input field empty
3. Click "Analyze PR" button
**Expected:**
- Error message "Please enter a PR URL" should appear
- Submit action should not be triggered
- Input field should be marked as invalid

### 2. Invalid PR URL Format
**Steps:**
1. Enter an invalid URL (e.g., "https://github.com/invalid")
2. Click "Analyze PR" button
**Expected:**
- Error message "Failed to process PR URL" should appear
- Submit action should not be triggered
- Input field should be marked as invalid

### 3. Valid PR URL Submission
**Steps:**
1. Enter a valid PR URL (e.g., "https://github.com/owner/repo/pull/123")
2. Click "Analyze PR" button
**Expected:**
- Form should be submitted successfully
- No error messages should appear
- Form should reset to initial state after submission

### 4. Loading State
**Steps:**
1. Enter a valid PR URL
2. Click "Analyze PR" button
**Expected:**
- Button text should change to "Validating..."
- Input field should be disabled
- Button should be disabled
- Once validation completes, form should return to normal state

### 5. Error Clearing
**Steps:**
1. Submit form with empty URL to trigger error
2. Start typing in the input field
**Expected:**
- Error message should disappear as soon as typing begins
- Input field should return to normal state

### 6. Accessibility
**Steps:**
1. Navigate through form using keyboard only
2. Use screen reader to interact with form
**Expected:**
- All form elements should be focusable
- Error messages should be announced by screen reader
- Input field should have proper aria labels
- Error states should be properly conveyed to assistive technology

## Notes
- These tests focus on UI interactions and user experience
- For automated testing, focus on unit tests for the PR validation logic and URL processing
- Consider using end-to-end testing tools like Cypress for critical user flows

## Related Components
- PRInputForm (`apps/web/src/components/pr-input-form.tsx`)
- PRValidator (`apps/web/src/lib/github/services/pr-validator.ts`)
