# Troubleshooting Guide - Herp Crossing

Quick solutions to common issues during Phase 1 validation testing.

## Field Form Issues

### "I can't capture my location"

**Problem:** GPS button doesn't work or shows error

**Solutions:**
1. **Check location permissions**
   - iOS: Settings → Safari → Location → Allow
   - Android: Settings → Apps → Chrome → Permissions → Location → Allow

2. **Make sure you're outside or near a window**
   - GPS needs clear view of sky
   - Won't work well indoors

3. **Wait 10-15 seconds**
   - First GPS fix can take time
   - Be patient!

4. **Try refreshing the page**
   - Sometimes helps reset GPS

**If still not working:** You can manually enter coordinates later or estimate location on a map.

---

### "My location shows weird numbers like 42.444"

**This is normal!** Those are GPS coordinates (latitude/longitude):
- Latitude: 42.444 means 42.444° North
- Longitude: -76.502 means 76.502° West

You don't need to understand them - they're automatically captured for mapping later.

---

### "I submitted but nothing happened"

**Check for these:**

1. **Look for green success message**
   - Should say "✅ Patrol submitted successfully!"
   - If you see this, it worked!

2. **Check if you're offline**
   - Look for orange "Offline Mode" banner at top
   - If offline, it says "Patrol saved offline. Will sync when online."
   - This is OKAY - it will submit automatically when you get signal

3. **Check required fields**
   - Red * means required
   - Make sure: Date, Time, Location, Observer, Weather, Species, Count, Life Stage, Direction, Condition

4. **Try submitting again**
   - Sometimes network hiccups happen
   - Wait 5 seconds and click submit again

---

### "My patrol disappeared after submitting"

**This is normal!** The form clears after successful submit so you can enter the next patrol.

Your data is saved. To see your previous patrols:
- Go to the Detail Form
- Enter your observer name
- Your patrols will load

---

### "I went offline and now I'm back online but it didn't sync"

**Two ways to sync:**

1. **Automatic sync:** Happens when you reload the page or come back online
   - Refresh the page (pull down on mobile)
   - Should see "Synced X offline patrol(s)!" message

2. **Manual check:** Open browser console (developer tools) and look for sync messages
   - Or just submit a new observation - that triggers sync too

**If still stuck:** Your offline patrols are saved in browser storage, they won't disappear. Contact support.

---

### "I accidentally closed the browser mid-patrol"

**Don't worry!** The form remembers:
- Your observer name (saved)
- Your location (if captured)

BUT you'll need to re-enter:
- Date/time
- Weather
- Observations

**Tip:** Always submit before closing browser!

---

## Detail Form Issues

### "I can't find my patrols"

**Check these:**

1. **Spelling of observer name**
   - Must match EXACTLY what you entered in field form
   - Case sensitive: "Jane" ≠ "jane"
   - Check for extra spaces: "Jane " ≠ "Jane"

2. **Wait a few seconds**
   - After entering name, click "Load Patrols"
   - Takes 2-5 seconds to fetch from server

3. **Check if you actually submitted patrols**
   - Did you see success message?
   - Were you offline? (Check field form for pending patrols)

**Still not showing?** Contact support with your observer name.

---

### "I can see my patrols but can't edit them"

**Steps:**
1. Click on the patrol card
2. Edit form should slide down
3. Fill in additional details
4. Click "Save Updates"
5. Should see "✅ Updates saved successfully!"

**If edit form doesn't appear:** Try refreshing the page and clicking the patrol card again.

---

### "Save button doesn't work"

**Check:**
1. Are you online? (Detail form requires internet)
2. Did you actually change anything? (No changes = nothing to save)
3. Look for error message in red at bottom of form

**If stuck:** Refresh page and try again. Your changes aren't lost - edit form will reload.

---

## General Issues

### "The page looks weird/broken on my phone"

**Try:**
1. Rotate phone to portrait mode (vertical)
2. Zoom out (pinch gesture)
3. Refresh page (pull down)
4. Clear browser cache:
   - iOS Safari: Settings → Safari → Clear History and Website Data
   - Android Chrome: Settings → Privacy → Clear browsing data

**If still broken:** Take a screenshot and send to support.

---

### "I need to delete an observation"

**Phase 1 limitation:** You can't delete observations through the forms.

**Options:**
1. **Edit it:** Add note saying "IGNORE - entered by mistake"
2. **Contact coordinator:** They can delete from Google Sheet directly

**Phase 2 will have delete functionality.**

---

### "I want to change my observer name"

**Field form:** Just type a new name - it will remember the new one.

**Detail form:** Enter different name to see different observer's patrols.

**Note:** Once submitted, observations are linked to the name you used. You can't rename past observations through the forms.

---

### "How do I know if my data was really saved?"

**Field form:**
- Look for green "✅ Patrol submitted successfully!" message
- Count increases by 1 in the message ("Submitted 3 observation(s)")

**Detail form:**
- After saving edits, patrol card updates to show "Detailed" badge
- Green success message appears

**Double-check:** Load your patrols in detail form - if they appear, they're saved!

---

## Species Identification Help

### "I'm not sure what species I saw"

**Options in order of preference:**

1. **Best guess from dropdown**
   - Select closest match
   - Add uncertainty in notes: "Possibly spotted salamander - unsure"

2. **Use "Unknown Salamander" or "Unknown Frog"**
   - Better than guessing wrong
   - Can update later after ID confirmation

3. **Use "Unknown"**
   - Last resort if you really don't know

4. **Add description in notes**
   - Color, size, markings
   - Photo URL if you took picture
   - Can help with later identification

**Remember:** Honest "unknown" is better than incorrect species!

---

## Data Entry Tips

### "Some fields are marked optional - should I fill them anyway?"

**Yes, if you can!**
- Temperature: Very useful for analysis
- Notes: Any context is helpful
- Road details (in detail form): Critical for identifying hotspots

**But don't stress:** Required fields are truly required, optional fields are optional.

---

### "I made a mistake in a field I already submitted"

**Use detail form to fix it:**
1. Load your patrols
2. Click the patrol with the error
3. Add correction in "Additional Notes" field:
   - "CORRECTION: Count should be 5, not 3"
   - "CORRECTION: Species was Blue-spotted, not Spotted"

**Coordinator will see the note and can fix the main data.**

---

## When to Contact Support

Contact your coordinator if:
- ❌ Location capture never works (after trying all steps)
- ❌ Patrols don't appear in detail form (after checking spelling)
- ❌ Repeated sync failures
- ❌ Data appears corrupted or wrong
- ❌ Page completely broken (not just weird-looking)

**Don't worry about:**
- ✅ Occasional network timeouts (try again)
- ✅ Offline mode triggering (it's a feature!)
- ✅ Form clearing after submit (that's normal)
- ✅ GPS coordinates looking like numbers (they're supposed to)

---

## Browser Recommendations

**Best experience:**
- iOS: Safari (built-in)
- Android: Chrome (built-in)

**Also works:**
- Firefox
- Edge
- Samsung Internet

**May have issues:**
- Very old browsers
- Private/incognito mode (offline won't work)

---

## Quick Diagnostics

If something's wrong and you're not sure what:

**Check these 5 things:**
1. ✓ Browser location permission enabled?
2. ✓ Internet connection working?
3. ✓ Correct URL? (github.io/herp-crossing)
4. ✓ Observer name spelled consistently?
5. ✓ Looking for green success message after submit?

**Still stuck?** Take screenshots and contact support!

---

## Emergency Contact

If you're in the field and something critical breaks:

1. **Take paper notes** - Old school backup!
2. **Take photos** - Capture species, location, conditions
3. **Enter data later** - When you're back at computer
4. **Email coordinator** - Describe what broke

**Remember:** The point of Phase 1 is to find these issues! Your feedback helps improve the system.

---

**Last updated:** November 20, 2025
**For Phase 1 validation testing**
**Questions?** Check README or contact project coordinator
