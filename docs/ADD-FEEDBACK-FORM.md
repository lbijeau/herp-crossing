# Adding Feedback Form Link

Once you create the Google Form for volunteer feedback, you need to add the link to both forms.

## Steps

### 1. Create the Google Form

Use the questions from `docs/FEEDBACK-FORM-QUESTIONS.md` to create a Google Form.

**Get the form URL:**
- Click "Send" in Google Forms
- Copy the link (looks like: `https://forms.gle/xxxxx` or `https://docs.google.com/forms/d/e/xxxxx/viewform`)

### 2. Update Both Forms

Edit these two files and replace `#` with your Google Form URL:

**File: `field-form/index.html` (line ~97)**
```html
<a href="#" id="feedback-link" style="color: #7c3aed; text-decoration: none;">💬 Share Feedback</a>
```

Change to:
```html
<a href="YOUR_GOOGLE_FORM_URL" id="feedback-link" style="color: #7c3aed; text-decoration: none;">💬 Share Feedback</a>
```

**File: `detail-form/index.html` (line ~90)**
```html
<a href="#" id="feedback-link" style="color: #7c3aed; text-decoration: none;">💬 Share Feedback</a>
```

Change to:
```html
<a href="YOUR_GOOGLE_FORM_URL" id="feedback-link" style="color: #7c3aed; text-decoration: none;">💬 Share Feedback</a>
```

### 3. Commit and Push

```bash
git add field-form/index.html detail-form/index.html
git commit -m "Add feedback form link"
git push origin master
```

### 4. Wait for Deployment

GitHub Pages will rebuild in 1-2 minutes. Then the feedback links will be live!

## Alternative: Skip Adding Form to HTML

If you prefer NOT to edit the HTML files, you can instead:

1. Share the feedback form URL directly with volunteers via:
   - Email
   - Text message
   - Printed on instruction sheet

2. Include it in the volunteer testing guide

3. Add it to the README

The footer links will just show "#" (do nothing when clicked), which is fine for Phase 1.

## Recommended Approach

For Phase 1, the **alternative approach** (sharing URL directly) is probably easier:
- No need to redeploy
- Can change form URL anytime
- Volunteers bookmark form separately

For Phase 2, integrate feedback properly into the UI.
