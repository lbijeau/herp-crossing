# Phase 1 Validation System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build minimal viable data collection system (web forms + Google Sheets) to validate workflow with real volunteers during spring amphibian migration.

**Architecture:** Two simple web forms (field capture + detail entry) that communicate with Google Sheets via Apps Script API. Field form works offline using LocalStorage. Deployed on GitHub Pages for easy access.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Google Sheets, Google Apps Script, GitHub Pages

---

## Task 1: Project Structure Setup

**Files:**
- Create: `field-form/index.html`
- Create: `field-form/styles.css`
- Create: `field-form/field-form.js`
- Create: `detail-form/index.html`
- Create: `detail-form/styles.css`
- Create: `detail-form/detail-form.js`
- Create: `scripts/README.md`
- Create: `README.md`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p field-form detail-form scripts
```

**Step 2: Create README with project overview**

File: `README.md`
```markdown
# Amphibian Road Mortality Data Collection - Phase 1

Validation system for testing standardized data collection workflow with volunteers.

## Components

- **Field Form** (`field-form/`) - Quick capture interface for field use
- **Detail Form** (`detail-form/`) - Review and add details after patrol
- **Scripts** (`scripts/`) - Google Apps Script for Sheets integration

## Setup

1. Copy Google Apps Script to your Google Sheet (see `scripts/README.md`)
2. Update API endpoint URLs in JavaScript files
3. Deploy to GitHub Pages or open `field-form/index.html` locally

## Usage

- **Volunteers:** Bookmark `field-form/index.html` on phone
- **After patrol:** Use `detail-form/index.html` to add details

See `docs/plans/2025-11-19-amphibian-road-mortality-data-collection-design.md` for complete design.
```

**Step 3: Create scripts README**

File: `scripts/README.md`
```markdown
# Google Apps Script Setup

## Instructions

1. Create a new Google Sheet for data collection
2. Name it "Amphibian Road Crossings - Phase 1 Data"
3. Tools → Script editor
4. Copy `google-apps-script.js` into the script editor
5. Save and deploy as web app
6. Copy the deployment URL
7. Update `APPS_SCRIPT_URL` in both `field-form/field-form.js` and `detail-form/detail-form.js`

## Endpoints

- `POST ?action=submit` - Submit field observations
- `GET ?action=getPatrols&observer=name` - Fetch patrols for observer
- `POST ?action=update` - Update patrol details
```

**Step 4: Commit project structure**

```bash
git add README.md scripts/README.md
git commit -m "docs: add project structure and setup instructions"
```

---

## Task 2: Google Sheet Setup

**Files:**
- Create: `scripts/google-apps-script.js`
- Create: `scripts/sheet-setup-instructions.md`

**Step 1: Document Google Sheet column structure**

File: `scripts/sheet-setup-instructions.md`
```markdown
# Google Sheet Setup Instructions

## Sheet Structure

Create a sheet named "Observations" with these columns (Row 1 headers):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SubmitTime | PatrolDate | PatrolTime | Latitude | Longitude | Observer | Weather | Temperature | Species | Count | LifeStage | Direction | Condition | Notes |

**Column Details:**
- SubmitTime: Auto-generated timestamp when form submitted
- PatrolDate: Date of patrol (YYYY-MM-DD)
- PatrolTime: Time of patrol (HH:MM)
- Latitude: GPS latitude
- Longitude: GPS longitude
- Observer: Volunteer name/ID
- Weather: Clear/Cloudy/Rain/Fog
- Temperature: Degrees F (optional)
- Species: Species common name
- Count: Number observed
- LifeStage: Adult/Juvenile/Egg mass
- Direction: To breeding site/From breeding site/Unclear
- Condition: Alive-helped/Alive-already crossed/Dead/Injured
- Notes: Optional text

## Permissions

Share with "Anyone with link can edit" for Phase 1 testing.
(Phase 2 will have proper authentication)
```

**Step 2: Create Google Apps Script API**

File: `scripts/google-apps-script.js`
```javascript
// Amphibian Road Mortality - Google Apps Script API
// Deploy as web app: Execute as "Me", Access "Anyone"

function doPost(e) {
  const action = e.parameter.action;

  if (action === 'submit') {
    return handleSubmit(e);
  } else if (action === 'update') {
    return handleUpdate(e);
  }

  return jsonResponse({ error: 'Unknown action' }, 400);
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getPatrols') {
    return handleGetPatrols(e);
  }

  return jsonResponse({ error: 'Unknown action' }, 400);
}

function handleSubmit(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Observations');

    // data.observations is an array of observations from one patrol
    const rows = data.observations.map(obs => [
      new Date(), // SubmitTime
      data.patrolDate,
      data.patrolTime,
      data.latitude,
      data.longitude,
      data.observer,
      data.weather,
      data.temperature || '',
      obs.species,
      obs.count,
      obs.lifeStage,
      obs.direction,
      obs.condition,
      obs.notes || ''
    ]);

    // Append all observations
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 14).setValues(rows);
    }

    return jsonResponse({
      success: true,
      message: `Submitted ${rows.length} observation(s)`
    });
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function handleGetPatrols(e) {
  try {
    const observer = e.parameter.observer;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Observations');
    const data = sheet.getDataRange().getValues();

    // Skip header row, filter by observer
    const patrols = data.slice(1)
      .filter(row => row[5] === observer) // Column F (Observer)
      .map((row, idx) => ({
        rowIndex: idx + 2, // +2 because we skipped header and arrays are 0-indexed
        submitTime: row[0],
        patrolDate: row[1],
        patrolTime: row[2],
        latitude: row[3],
        longitude: row[4],
        observer: row[5],
        weather: row[6],
        temperature: row[7],
        species: row[8],
        count: row[9],
        lifeStage: row[10],
        direction: row[11],
        condition: row[12],
        notes: row[13]
      }));

    return jsonResponse({ patrols });
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function handleUpdate(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Observations');

    // Update specific row
    const row = data.rowIndex;
    sheet.getRange(row, 1, 1, 14).setValues([[
      data.submitTime,
      data.patrolDate,
      data.patrolTime,
      data.latitude,
      data.longitude,
      data.observer,
      data.weather,
      data.temperature || '',
      data.species,
      data.count,
      data.lifeStage,
      data.direction,
      data.condition,
      data.notes || ''
    ]]);

    return jsonResponse({ success: true, message: 'Updated observation' });
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function jsonResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Step 3: Test Apps Script manually**

1. Create Google Sheet with column headers from `sheet-setup-instructions.md`
2. Copy `google-apps-script.js` to Script Editor
3. Deploy as web app (Execute as "Me", Access "Anyone")
4. Test POST endpoint with sample data using Postman or curl
5. Verify data appears in sheet

**Step 4: Commit Google Apps Script**

```bash
git add scripts/
git commit -m "feat: add Google Apps Script API for Sheets integration"
```

---

## Task 3: Field Form - Basic Structure

**Files:**
- Create: `field-form/index.html`
- Create: `field-form/styles.css`

**Step 1: Create field form HTML structure**

File: `field-form/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Amphibian Patrol - Field Form</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🦎 Amphibian Patrol</h1>
            <p class="subtitle">Quick Field Capture</p>
        </header>

        <div id="status-message" class="status-message hidden"></div>

        <form id="patrol-form">
            <!-- Session Info Section -->
            <section class="form-section">
                <h2>Patrol Session</h2>

                <div class="form-group">
                    <label for="observer">Your Name/ID</label>
                    <input type="text" id="observer" required>
                    <small>Will be saved for next time</small>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="patrol-date">Date</label>
                        <input type="date" id="patrol-date" required>
                    </div>
                    <div class="form-group">
                        <label for="patrol-time">Time</label>
                        <input type="time" id="patrol-time" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Location</label>
                    <button type="button" id="get-location" class="btn btn-secondary">
                        📍 Get My Location
                    </button>
                    <div id="location-display" class="location-display hidden">
                        <small>Lat: <span id="lat-display">--</span>, Lon: <span id="lon-display">--</span></small>
                    </div>
                    <input type="hidden" id="latitude">
                    <input type="hidden" id="longitude">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="weather">Weather</label>
                        <select id="weather" required>
                            <option value="">Select...</option>
                            <option value="Clear">Clear</option>
                            <option value="Cloudy">Cloudy</option>
                            <option value="Rain">Rain</option>
                            <option value="Fog">Fog</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="temperature">Temp (°F)</label>
                        <input type="number" id="temperature" placeholder="Optional">
                    </div>
                </div>
            </section>

            <!-- Observations Section -->
            <section class="form-section">
                <h2>Observations</h2>
                <div id="observations-container">
                    <!-- Observation entries will be added here dynamically -->
                </div>
                <button type="button" id="add-observation" class="btn btn-secondary">
                    ➕ Add Observation
                </button>
            </section>

            <!-- Submit Section -->
            <section class="form-section">
                <button type="submit" class="btn btn-primary">
                    📤 Submit Patrol
                </button>
                <p class="offline-notice hidden" id="offline-notice">
                    ⚠️ You're offline. Data will be saved and submitted when connection returns.
                </p>
            </section>
        </form>
    </div>

    <script src="field-form.js"></script>
</body>
</html>
```

**Step 2: Create basic CSS styling**

File: `field-form/styles.css`
```css
/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 1rem;
    color: #333;
}

.container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

/* Header */
header {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    color: white;
    padding: 1.5rem;
    text-align: center;
}

header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
}

.subtitle {
    font-size: 0.875rem;
    opacity: 0.8;
}

/* Status Messages */
.status-message {
    padding: 1rem;
    margin: 1rem;
    border-radius: 8px;
    font-weight: 500;
    text-align: center;
}

.status-message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.status-message.hidden {
    display: none;
}

/* Form Sections */
.form-section {
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.form-section:last-child {
    border-bottom: none;
}

.form-section h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: #2d3748;
}

/* Form Groups */
.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #4a5568;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #667eea;
}

.form-group small {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #718096;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    width: 100%;
}

.btn:active {
    transform: scale(0.98);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-secondary {
    background: #e2e8f0;
    color: #2d3748;
}

.btn-secondary:hover {
    background: #cbd5e0;
}

.btn-danger {
    background: #fc8181;
    color: white;
}

/* Location Display */
.location-display {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #edf2f7;
    border-radius: 6px;
}

.location-display.hidden {
    display: none;
}

/* Offline Notice */
.offline-notice {
    text-align: center;
    color: #d69e2e;
    font-size: 0.875rem;
    margin-top: 1rem;
}

.offline-notice.hidden {
    display: none;
}

/* Observation Entry */
.observation-entry {
    background: #f7fafc;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 2px solid #e2e8f0;
}

.observation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.observation-number {
    font-weight: 600;
    color: #4a5568;
}

.btn-remove {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    width: auto;
}

/* Responsive */
@media (max-width: 480px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    body {
        padding: 0;
    }

    .container {
        border-radius: 0;
    }
}

/* Utility */
.hidden {
    display: none;
}
```

**Step 3: Test HTML structure**

1. Open `field-form/index.html` in browser
2. Verify header displays correctly
3. Verify form sections are visible
4. Verify responsive layout on mobile (use browser dev tools)

**Step 4: Commit field form structure**

```bash
git add field-form/index.html field-form/styles.css
git commit -m "feat: add field form HTML structure and styling"
```

---

## Task 4: Field Form - GPS and Location Capture

**Files:**
- Create: `field-form/field-form.js`

**Step 1: Initialize JavaScript and handle location**

File: `field-form/field-form.js`
```javascript
// Configuration
const APPS_SCRIPT_URL = 'YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE'; // TODO: Update after deployment

// State
let observations = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
    checkOnlineStatus();
});

function initializeForm() {
    // Set current date and time
    const now = new Date();
    document.getElementById('patrol-date').valueAsDate = now;
    document.getElementById('patrol-time').value = now.toTimeString().slice(0, 5);

    // Load saved observer name
    const savedObserver = localStorage.getItem('observer');
    if (savedObserver) {
        document.getElementById('observer').value = savedObserver;
    }

    // Add first observation entry
    addObservationEntry();
}

function setupEventListeners() {
    // Location button
    document.getElementById('get-location').addEventListener('click', getCurrentLocation);

    // Add observation button
    document.getElementById('add-observation').addEventListener('click', addObservationEntry);

    // Form submit
    document.getElementById('patrol-form').addEventListener('submit', handleSubmit);

    // Online/offline status
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
}

// Location handling
function getCurrentLocation() {
    const button = document.getElementById('get-location');
    button.textContent = '📍 Getting location...';
    button.disabled = true;

    if (!navigator.geolocation) {
        showStatus('Geolocation is not supported by your browser', 'error');
        button.textContent = '📍 Get My Location';
        button.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lon = position.coords.longitude.toFixed(6);

            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lon;
            document.getElementById('lat-display').textContent = lat;
            document.getElementById('lon-display').textContent = lon;
            document.getElementById('location-display').classList.remove('hidden');

            button.textContent = '✅ Location Captured';
            button.disabled = false;

            showStatus('Location captured successfully!', 'success');
            setTimeout(() => hideStatus(), 3000);
        },
        (error) => {
            let message = 'Unable to get location';
            if (error.code === error.PERMISSION_DENIED) {
                message = 'Location permission denied. Please enable location access.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                message = 'Location unavailable. Try again.';
            } else if (error.code === error.TIMEOUT) {
                message = 'Location request timed out. Try again.';
            }

            showStatus(message, 'error');
            button.textContent = '📍 Get My Location';
            button.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function checkOnlineStatus() {
    const offlineNotice = document.getElementById('offline-notice');
    if (!navigator.onLine) {
        offlineNotice.classList.remove('hidden');
    } else {
        offlineNotice.classList.add('hidden');
    }
}

function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
}

function hideStatus() {
    const statusEl = document.getElementById('status-message');
    statusEl.className = 'status-message hidden';
}

// Placeholder functions (will be implemented in next tasks)
function addObservationEntry() {
    console.log('Add observation - to be implemented');
}

function handleSubmit(e) {
    e.preventDefault();
    console.log('Submit - to be implemented');
}
```

**Step 2: Test location capture**

1. Open `field-form/index.html` in browser
2. Click "Get My Location" button
3. Accept location permission prompt
4. Verify coordinates display correctly
5. Test with location permission denied
6. Verify error message displays

**Step 3: Commit location functionality**

```bash
git add field-form/field-form.js
git commit -m "feat: add GPS location capture for field form"
```

---

## Task 5: Field Form - Observation Entry

**Files:**
- Modify: `field-form/field-form.js`

**Step 1: Implement dynamic observation entries**

Add to `field-form/field-form.js` (replace placeholder):

```javascript
// Replace the placeholder addObservationEntry function with this:

function addObservationEntry() {
    const container = document.getElementById('observations-container');
    const index = observations.length;

    const observationDiv = document.createElement('div');
    observationDiv.className = 'observation-entry';
    observationDiv.dataset.index = index;

    observationDiv.innerHTML = `
        <div class="observation-header">
            <span class="observation-number">Observation #${index + 1}</span>
            ${index > 0 ? `<button type="button" class="btn btn-danger btn-remove" onclick="removeObservation(${index})">Remove</button>` : ''}
        </div>

        <div class="form-group">
            <label for="species-${index}">Species</label>
            <select id="species-${index}" required>
                <option value="">Select species...</option>
                <option value="Spotted Salamander">Spotted Salamander</option>
                <option value="Blue-spotted Salamander">Blue-spotted Salamander</option>
                <option value="Jefferson Salamander">Jefferson Salamander</option>
                <option value="Red-spotted Newt">Red-spotted Newt</option>
                <option value="Spring Peeper">Spring Peeper</option>
                <option value="Wood Frog">Wood Frog</option>
                <option value="American Toad">American Toad</option>
                <option value="Gray Treefrog">Gray Treefrog</option>
                <option value="Unknown Salamander">Unknown Salamander</option>
                <option value="Unknown Frog">Unknown Frog</option>
                <option value="Unknown">Unknown</option>
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="count-${index}">Count</label>
                <input type="number" id="count-${index}" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label for="life-stage-${index}">Life Stage</label>
                <select id="life-stage-${index}" required>
                    <option value="Adult">Adult</option>
                    <option value="Juvenile">Juvenile</option>
                    <option value="Egg mass">Egg mass</option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="direction-${index}">Direction</label>
            <select id="direction-${index}" required>
                <option value="To breeding site">To breeding site</option>
                <option value="From breeding site">From breeding site</option>
                <option value="Unclear">Unclear</option>
            </select>
        </div>

        <div class="form-group">
            <label for="condition-${index}">Condition</label>
            <select id="condition-${index}" required>
                <option value="Alive - helped across">Alive - helped across</option>
                <option value="Alive - already crossed">Alive - already crossed</option>
                <option value="Dead">Dead</option>
                <option value="Injured">Injured</option>
            </select>
        </div>

        <div class="form-group">
            <label for="notes-${index}">Notes (optional)</label>
            <input type="text" id="notes-${index}" placeholder="Any additional details...">
        </div>
    `;

    container.appendChild(observationDiv);
    observations.push({ index });
}

function removeObservation(index) {
    const entry = document.querySelector(`[data-index="${index}"]`);
    if (entry) {
        entry.remove();
        observations = observations.filter(obs => obs.index !== index);

        // Renumber remaining observations
        document.querySelectorAll('.observation-entry').forEach((entry, idx) => {
            const number = entry.querySelector('.observation-number');
            if (number) {
                number.textContent = `Observation #${idx + 1}`;
            }
        });
    }
}
```

**Step 2: Test observation entry**

1. Refresh `field-form/index.html`
2. Verify one observation entry appears by default
3. Click "Add Observation" button
4. Verify second observation appears
5. Verify species dropdown has correct options
6. Click "Remove" on second observation
7. Verify it's removed and first observation remains

**Step 3: Commit observation entry**

```bash
git add field-form/field-form.js
git commit -m "feat: add dynamic observation entry to field form"
```

---

## Task 6: Field Form - Offline Support

**Files:**
- Modify: `field-form/field-form.js`

**Step 1: Implement offline storage**

Add to `field-form/field-form.js`:

```javascript
// Add these functions after the removeObservation function:

function saveOfflinePatrol(patrolData) {
    let offlinePatrols = JSON.parse(localStorage.getItem('offlinePatrols') || '[]');
    offlinePatrols.push({
        data: patrolData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('offlinePatrols', JSON.stringify(offlinePatrols));
    showStatus('Patrol saved offline. Will sync when online.', 'success');
}

function syncOfflinePatrols() {
    const offlinePatrols = JSON.parse(localStorage.getItem('offlinePatrols') || '[]');

    if (offlinePatrols.length === 0) {
        return Promise.resolve();
    }

    console.log(`Syncing ${offlinePatrols.length} offline patrol(s)...`);

    const syncPromises = offlinePatrols.map(patrol =>
        submitPatrolToServer(patrol.data)
    );

    return Promise.all(syncPromises)
        .then(() => {
            localStorage.removeItem('offlinePatrols');
            showStatus(`Synced ${offlinePatrols.length} offline patrol(s)!`, 'success');
        })
        .catch(error => {
            console.error('Error syncing offline patrols:', error);
        });
}

// Check for offline patrols when coming back online
window.addEventListener('online', () => {
    checkOnlineStatus();
    syncOfflinePatrols();
});

// Try to sync offline patrols on page load if online
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
    checkOnlineStatus();

    if (navigator.onLine) {
        syncOfflinePatrols();
    }
});
```

**Step 2: Test offline storage**

1. Open browser DevTools → Network tab
2. Set to "Offline" mode
3. Fill out patrol form (note: submit won't work yet)
4. Verify offline notice appears
5. Open DevTools → Application → Local Storage
6. Verify observer name is saved
7. Set back to "Online" mode
8. Verify offline notice disappears

**Step 3: Commit offline support**

```bash
git add field-form/field-form.js
git commit -m "feat: add offline storage and sync for field form"
```

---

## Task 7: Field Form - Submit to Sheets

**Files:**
- Modify: `field-form/field-form.js`

**Step 1: Implement form submission**

Replace the placeholder `handleSubmit` function in `field-form/field-form.js`:

```javascript
// Replace the placeholder handleSubmit function with this:

function handleSubmit(e) {
    e.preventDefault();

    // Validate location
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    if (!latitude || !longitude) {
        showStatus('Please capture your location before submitting', 'error');
        return;
    }

    // Save observer name
    const observer = document.getElementById('observer').value;
    localStorage.setItem('observer', observer);

    // Collect patrol data
    const patrolData = {
        patrolDate: document.getElementById('patrol-date').value,
        patrolTime: document.getElementById('patrol-time').value,
        latitude: latitude,
        longitude: longitude,
        observer: observer,
        weather: document.getElementById('weather').value,
        temperature: document.getElementById('temperature').value,
        observations: []
    };

    // Collect all observations
    const observationEntries = document.querySelectorAll('.observation-entry');
    observationEntries.forEach((entry, idx) => {
        patrolData.observations.push({
            species: document.getElementById(`species-${idx}`).value,
            count: parseInt(document.getElementById(`count-${idx}`).value),
            lifeStage: document.getElementById(`life-stage-${idx}`).value,
            direction: document.getElementById(`direction-${idx}`).value,
            condition: document.getElementById(`condition-${idx}`).value,
            notes: document.getElementById(`notes-${idx}`).value
        });
    });

    // Submit or save offline
    if (navigator.onLine) {
        submitPatrolToServer(patrolData)
            .then(() => {
                showStatus('✅ Patrol submitted successfully!', 'success');
                setTimeout(() => {
                    resetForm();
                }, 2000);
            })
            .catch(error => {
                showStatus(`Error: ${error.message}. Saved offline instead.`, 'error');
                saveOfflinePatrol(patrolData);
            });
    } else {
        saveOfflinePatrol(patrolData);
    }
}

function submitPatrolToServer(patrolData) {
    return fetch(`${APPS_SCRIPT_URL}?action=submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(patrolData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server error');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    });
}

function resetForm() {
    // Clear observations
    document.getElementById('observations-container').innerHTML = '';
    observations = [];

    // Reset session fields (except observer which is saved)
    document.getElementById('patrol-form').reset();

    // Re-initialize
    initializeForm();

    hideStatus();
}
```

**Step 2: Update APPS_SCRIPT_URL**

1. Get your deployed Google Apps Script URL
2. Replace `YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE` in `field-form.js`
3. Save the file

**Step 3: Test form submission**

1. Open `field-form/index.html`
2. Fill out complete patrol with location and observations
3. Submit form
4. Verify success message appears
5. Check Google Sheet - verify data appears
6. Verify form resets after submission
7. Test offline submission (DevTools → Offline)
8. Go back online and verify offline patrol syncs

**Step 4: Commit submission functionality**

```bash
git add field-form/field-form.js
git commit -m "feat: add form submission and offline sync to Google Sheets"
```

---

## Task 8: Detail Form - Basic Structure

**Files:**
- Create: `detail-form/index.html`
- Create: `detail-form/styles.css`

**Step 1: Create detail form HTML**

File: `detail-form/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amphibian Patrol - Detail Entry</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🦎 Amphibian Patrol</h1>
            <p class="subtitle">Add Patrol Details</p>
        </header>

        <div id="status-message" class="status-message hidden"></div>

        <!-- Observer Selection -->
        <section class="form-section">
            <h2>Load Your Patrols</h2>
            <div class="form-group">
                <label for="observer-select">Your Name/ID</label>
                <input type="text" id="observer-select" placeholder="Enter your observer name">
                <small>Same name you used in the field form</small>
            </div>
            <button id="load-patrols" class="btn btn-primary">Load Patrols</button>
        </section>

        <!-- Patrols List -->
        <section id="patrols-section" class="form-section hidden">
            <h2>Your Recent Patrols</h2>
            <div id="patrols-container">
                <!-- Patrol entries will be loaded here -->
            </div>
        </section>

        <!-- Edit Form (hidden until patrol selected) -->
        <section id="edit-section" class="form-section hidden">
            <h2>Edit Observation</h2>
            <form id="edit-form">
                <input type="hidden" id="edit-row-index">

                <div class="form-group">
                    <label>Species</label>
                    <input type="text" id="edit-species" readonly>
                </div>

                <div class="form-group">
                    <label for="edit-road-name">Road Name</label>
                    <input type="text" id="edit-road-name" placeholder="e.g., Ringwood Road">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-speed-limit">Speed Limit (mph)</label>
                        <input type="number" id="edit-speed-limit" placeholder="e.g., 35">
                    </div>
                    <div class="form-group">
                        <label for="edit-traffic-volume">Traffic Volume</label>
                        <select id="edit-traffic-volume">
                            <option value="">Select...</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-additional-notes">Additional Notes</label>
                    <textarea id="edit-additional-notes" rows="3" placeholder="Add any additional observations or context..."></textarea>
                </div>

                <div class="form-group">
                    <label for="edit-photo-url">Photo URL (Google Drive link)</label>
                    <input type="url" id="edit-photo-url" placeholder="https://drive.google.com/...">
                    <small>Upload photos to Google Drive and paste the share link</small>
                </div>

                <div class="button-row">
                    <button type="submit" class="btn btn-primary">Save Updates</button>
                    <button type="button" id="cancel-edit" class="btn btn-secondary">Cancel</button>
                </div>
            </form>
        </section>
    </div>

    <script src="detail-form.js"></script>
</body>
</html>
```

**Step 2: Create detail form CSS**

File: `detail-form/styles.css`
```css
/* Import field form styles as base */
@import url('../field-form/styles.css');

/* Additional styles for detail form */

.patrol-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.patrol-card:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.patrol-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.75rem;
}

.patrol-info {
    flex: 1;
}

.patrol-date {
    font-weight: 600;
    color: #2d3748;
    font-size: 1.1rem;
}

.patrol-time {
    color: #718096;
    font-size: 0.875rem;
}

.patrol-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-complete {
    background: #c6f6d5;
    color: #22543d;
}

.badge-incomplete {
    background: #fed7d7;
    color: #742a2a;
}

.patrol-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    font-size: 0.875rem;
}

.detail-item {
    color: #4a5568;
}

.detail-label {
    font-weight: 500;
    color: #718096;
}

textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
}

textarea:focus {
    outline: none;
    border-color: #667eea;
}

.button-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

@media (max-width: 480px) {
    .patrol-details {
        grid-template-columns: 1fr;
    }
}
```

**Step 3: Test detail form structure**

1. Open `detail-form/index.html` in browser
2. Verify header and sections display correctly
3. Verify responsive layout
4. Verify styles imported correctly from field form

**Step 4: Commit detail form structure**

```bash
git add detail-form/
git commit -m "feat: add detail form HTML structure and styling"
```

---

## Task 9: Detail Form - Fetch and Edit Patrols

**Files:**
- Create: `detail-form/detail-form.js`

**Step 1: Create detail form JavaScript**

File: `detail-form/detail-form.js`
```javascript
// Configuration
const APPS_SCRIPT_URL = 'YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE'; // TODO: Update

// State
let currentPatrols = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSavedObserver();
});

function setupEventListeners() {
    document.getElementById('load-patrols').addEventListener('click', loadPatrols);
    document.getElementById('edit-form').addEventListener('submit', saveEdit);
    document.getElementById('cancel-edit').addEventListener('click', cancelEdit);
}

function loadSavedObserver() {
    const savedObserver = localStorage.getItem('observer');
    if (savedObserver) {
        document.getElementById('observer-select').value = savedObserver;
    }
}

function loadPatrols() {
    const observer = document.getElementById('observer-select').value.trim();

    if (!observer) {
        showStatus('Please enter your observer name', 'error');
        return;
    }

    showStatus('Loading patrols...', 'success');

    fetch(`${APPS_SCRIPT_URL}?action=getPatrols&observer=${encodeURIComponent(observer)}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }

            currentPatrols = data.patrols || [];
            displayPatrols(currentPatrols);

            if (currentPatrols.length === 0) {
                showStatus('No patrols found for this observer', 'error');
            } else {
                showStatus(`Loaded ${currentPatrols.length} observation(s)`, 'success');
                setTimeout(hideStatus, 3000);
            }
        })
        .catch(error => {
            showStatus(`Error loading patrols: ${error.message}`, 'error');
        });
}

function displayPatrols(patrols) {
    const container = document.getElementById('patrols-container');
    const section = document.getElementById('patrols-section');

    if (patrols.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    container.innerHTML = '';

    patrols.forEach((patrol, idx) => {
        const card = document.createElement('div');
        card.className = 'patrol-card';
        card.onclick = () => editPatrol(idx);

        // Check if patrol has additional details
        const hasDetails = patrol.notes && patrol.notes.trim().length > 0;

        card.innerHTML = `
            <div class="patrol-header">
                <div class="patrol-info">
                    <div class="patrol-date">${formatDate(patrol.patrolDate)}</div>
                    <div class="patrol-time">${patrol.patrolTime}</div>
                </div>
                <span class="patrol-badge ${hasDetails ? 'badge-complete' : 'badge-incomplete'}">
                    ${hasDetails ? 'Detailed' : 'Basic'}
                </span>
            </div>
            <div class="patrol-details">
                <div class="detail-item">
                    <span class="detail-label">Species:</span> ${patrol.species}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Count:</span> ${patrol.count}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Condition:</span> ${patrol.condition}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Weather:</span> ${patrol.weather}
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function editPatrol(index) {
    const patrol = currentPatrols[index];

    // Populate form
    document.getElementById('edit-row-index').value = patrol.rowIndex;
    document.getElementById('edit-species').value = patrol.species;

    // Populate additional fields from notes if they exist
    // (In Phase 1, these will be added to the notes field as structured text)
    document.getElementById('edit-road-name').value = '';
    document.getElementById('edit-speed-limit').value = '';
    document.getElementById('edit-traffic-volume').value = '';
    document.getElementById('edit-additional-notes').value = patrol.notes || '';
    document.getElementById('edit-photo-url').value = '';

    // Show edit section
    document.getElementById('edit-section').classList.remove('hidden');
    document.getElementById('edit-section').scrollIntoView({ behavior: 'smooth' });
}

function saveEdit(e) {
    e.preventDefault();

    const rowIndex = document.getElementById('edit-row-index').value;
    const patrol = currentPatrols.find(p => p.rowIndex == rowIndex);

    if (!patrol) {
        showStatus('Error: Patrol not found', 'error');
        return;
    }

    // Collect additional details into structured notes
    const roadName = document.getElementById('edit-road-name').value;
    const speedLimit = document.getElementById('edit-speed-limit').value;
    const trafficVolume = document.getElementById('edit-traffic-volume').value;
    const additionalNotes = document.getElementById('edit-additional-notes').value;
    const photoUrl = document.getElementById('edit-photo-url').value;

    let detailedNotes = patrol.notes || '';

    if (roadName) detailedNotes += `\nRoad: ${roadName}`;
    if (speedLimit) detailedNotes += `\nSpeed Limit: ${speedLimit} mph`;
    if (trafficVolume) detailedNotes += `\nTraffic: ${trafficVolume}`;
    if (additionalNotes) detailedNotes += `\nNotes: ${additionalNotes}`;
    if (photoUrl) detailedNotes += `\nPhoto: ${photoUrl}`;

    // Update patrol object
    const updatedPatrol = {
        ...patrol,
        notes: detailedNotes.trim()
    };

    // Submit update
    showStatus('Saving updates...', 'success');

    fetch(`${APPS_SCRIPT_URL}?action=update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPatrol)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }

        showStatus('✅ Updates saved successfully!', 'success');

        // Update local state
        const idx = currentPatrols.findIndex(p => p.rowIndex == rowIndex);
        if (idx !== -1) {
            currentPatrols[idx] = updatedPatrol;
            displayPatrols(currentPatrols);
        }

        // Hide edit form
        setTimeout(() => {
            cancelEdit();
            hideStatus();
        }, 2000);
    })
    .catch(error => {
        showStatus(`Error saving: ${error.message}`, 'error');
    });
}

function cancelEdit() {
    document.getElementById('edit-section').classList.add('hidden');
    document.getElementById('edit-form').reset();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
}

function hideStatus() {
    const statusEl = document.getElementById('status-message');
    statusEl.className = 'status-message hidden';
}
```

**Step 2: Update APPS_SCRIPT_URL**

Replace `YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE` with your actual Apps Script URL.

**Step 3: Test detail form functionality**

1. First, submit some patrols using field form
2. Open `detail-form/index.html`
3. Enter observer name and click "Load Patrols"
4. Verify patrols display correctly
5. Click on a patrol card
6. Verify edit form appears with patrol data
7. Add road details and notes
8. Click "Save Updates"
9. Verify success message
10. Check Google Sheet - verify notes updated
11. Reload patrols - verify badge changes to "Detailed"

**Step 4: Commit detail form functionality**

```bash
git add detail-form/detail-form.js
git commit -m "feat: add patrol loading and editing to detail form"
```

---

## Task 10: GitHub Pages Deployment

**Files:**
- Create: `index.html` (landing page)

**Step 1: Create landing page**

File: `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amphibian Road Mortality Data Collection</title>
    <link rel="stylesheet" href="field-form/styles.css">
    <style>
        .landing-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
        }

        .hero {
            text-align: center;
            margin-bottom: 3rem;
        }

        .hero h1 {
            font-size: 2.5rem;
            color: #2d3748;
            margin-bottom: 1rem;
        }

        .hero-emoji {
            font-size: 4rem;
            margin-bottom: 1rem;
        }

        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }

        .info-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .info-card h2 {
            color: #2d3748;
            margin-bottom: 1rem;
        }

        .info-card p {
            color: #4a5568;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .link-btn {
            display: inline-block;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="landing-container">
        <div class="hero">
            <div class="hero-emoji">🦎</div>
            <h1>Amphibian Road Mortality Data Collection</h1>
            <p style="font-size: 1.2rem; color: #4a5568;">
                Helping volunteers standardize amphibian road crossing data
            </p>
        </div>

        <div class="card-grid">
            <div class="info-card">
                <h2>📱 Field Form</h2>
                <p>Quick capture interface for use during patrol. Works offline and syncs when you're back online.</p>
                <a href="field-form/index.html" class="link-btn">
                    <button class="btn btn-primary">Open Field Form</button>
                </a>
            </div>

            <div class="info-card">
                <h2>✏️ Detail Form</h2>
                <p>Add road details, effort data, and notes to your observations after your patrol.</p>
                <a href="detail-form/index.html" class="link-btn">
                    <button class="btn btn-primary">Open Detail Form</button>
                </a>
            </div>
        </div>

        <div class="info-card" style="margin-top: 2rem;">
            <h2>📖 About This Project</h2>
            <p style="text-align: left;">
                This is a validation system (Phase 1) for standardizing amphibian road mortality data collection.
                Volunteers help salamanders and other amphibians cross roads safely during breeding migrations,
                and this tool makes it easy to collect consistent, high-quality data.
            </p>
            <p style="text-align: left;">
                <strong>How it works:</strong>
            </p>
            <ol style="text-align: left; color: #4a5568; line-height: 1.8;">
                <li>During patrol: Use <strong>Field Form</strong> on your phone to log observations quickly</li>
                <li>After patrol: Use <strong>Detail Form</strong> to add road details and additional notes</li>
                <li>Data is stored in Google Sheets for easy analysis and sharing</li>
            </ol>
            <p style="text-align: left; margin-top: 1rem;">
                <strong>Tips:</strong>
            </p>
            <ul style="text-align: left; color: #4a5568; line-height: 1.8;">
                <li>Bookmark the Field Form on your phone's home screen for quick access</li>
                <li>The Field Form works offline - data will sync when you're back online</li>
                <li>Use the same observer name in both forms so you can find your data</li>
            </ul>
        </div>
    </div>
</body>
</html>
```

**Step 2: Enable GitHub Pages**

1. Push all changes to GitHub:
```bash
git add .
git commit -m "feat: add landing page for GitHub Pages deployment"
git push origin master
```

2. On GitHub repository page:
   - Go to Settings → Pages
   - Source: Deploy from branch
   - Branch: master, folder: / (root)
   - Click Save

3. Wait 2-3 minutes for deployment

4. Visit: `https://[username].github.io/[repo-name]`

**Step 3: Test deployed site**

1. Visit your GitHub Pages URL
2. Test field form (submit patrol)
3. Test detail form (load and edit)
4. Test on mobile device
5. Test offline functionality (DevTools → Offline)

**Step 4: Document deployment**

Add to `README.md`:

```markdown
## Deployment

**Live Site:** https://[username].github.io/[repo-name]

### Field Form
- Bookmark: https://[username].github.io/[repo-name]/field-form/
- Use during patrol to log observations

### Detail Form
- URL: https://[username].github.io/[repo-name]/detail-form/
- Use after patrol to add details
```

**Step 5: Commit deployment docs**

```bash
git add README.md
git commit -m "docs: add deployment URLs to README"
git push origin master
```

---

## Task 11: Volunteer Testing Guide

**Files:**
- Create: `docs/volunteer-testing-guide.md`
- Create: `docs/volunteer-quick-reference.md`

**Step 1: Create testing guide**

File: `docs/volunteer-testing-guide.md`
```markdown
# Volunteer Testing Guide - Phase 1

## Overview

Thank you for helping test the Amphibian Road Mortality data collection system! This guide will walk you through testing both forms during the validation phase.

## Before Your Patrol

### 1. Bookmark the Field Form

**On iPhone:**
1. Open Safari and go to: [FIELD-FORM-URL]
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "Amphibian Patrol"
5. Tap "Add"

**On Android:**
1. Open Chrome and go to: [FIELD-FORM-URL]
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Name it "Amphibian Patrol"
5. Tap "Add"

### 2. Test Location Access

1. Open the bookmarked form
2. Tap "Get My Location"
3. Allow location access when prompted
4. Verify coordinates appear

### 3. Practice Entry (Optional)

Fill out a practice patrol with fake data to familiarize yourself with the form. Don't submit it.

## During Your Patrol

### Field Form Usage

1. **Start of Patrol:**
   - Open bookmarked form
   - Enter your name (use same name each time!)
   - Date and time auto-fill (edit if needed)
   - Tap "Get My Location"
   - Select weather
   - Enter temperature (optional)

2. **For Each Observation:**
   - Select species
   - Enter count
   - Select life stage, direction, condition
   - Add notes if helpful
   - Tap "Add Observation" for next one

3. **End of Patrol:**
   - Review all observations
   - Tap "Submit Patrol"
   - Wait for success message
   - Form will reset for next patrol

### Offline Use

- If you lose signal, keep using the form
- A warning will appear: "You're offline"
- Data saves locally on your phone
- When you get signal back, it syncs automatically

## After Your Patrol

### Detail Form Usage

1. Go to: [DETAIL-FORM-URL]
2. Enter your observer name (same as field form!)
3. Click "Load Patrols"
4. Your recent observations appear
5. Click any observation to add details:
   - Road name
   - Speed limit
   - Traffic volume
   - Additional notes
   - Photo links (if you uploaded to Google Drive)
6. Click "Save Updates"

## What We're Testing

Please provide feedback on:

### Usability
- Was anything confusing?
- Were any fields unclear?
- Did the offline mode work correctly?
- How long did it take to log one observation?

### Data Fields
- Did you skip any fields? Which ones?
- Were any species missing from the dropdown?
- What additional information would be helpful to collect?

### Workflow
- Did the two-phase approach (quick field + detailed later) work well?
- Would you prefer to enter everything at once?
- Any features that would make it easier?

## Providing Feedback

After 2-3 patrols, please complete this feedback survey:
[SURVEY-LINK]

Or email feedback to: [EMAIL]

## Troubleshooting

**Location won't capture:**
- Make sure you allowed location permission
- Try closing and reopening the form
- Check that location services are enabled on your phone

**Form won't submit:**
- Check internet connection
- If offline, data saves automatically
- Reconnect to WiFi and reopen form to sync

**Can't find my patrols in detail form:**
- Make sure you're using the exact same observer name
- Check spelling and capitalization
- Contact [EMAIL] if still having issues

## Data Access

All data is stored in this Google Sheet:
[SHEET-LINK]

You can view your submissions and analysis after each patrol.

---

Thank you for your help! Your feedback will make this tool better for everyone.
```

**Step 2: Create quick reference card**

File: `docs/volunteer-quick-reference.md`
```markdown
# Quick Reference Card

**Print this page and laminate for field use**

---

## 🦎 Amphibian Patrol - Field Quick Reference

### Before Starting
1. Open bookmarked form
2. Enter your name
3. Get location (📍 button)
4. Set weather and temp

### For Each Amphibian
1. Species (dropdown)
2. Count (number)
3. Life stage (Adult/Juvenile/Egg mass)
4. Direction (To/From/Unclear)
5. Condition (Helped/Crossed/Dead/Injured)
6. Notes (optional)
7. ➕ Add another OR 📤 Submit when done

### Tips
- ✅ Use same name every time
- ✅ Works offline (syncs later)
- ✅ One submit per patrol (multiple observations OK)
- ✅ Add details later at home

### Field Form URL
[URL OR QR CODE]

### Help
Contact: [EMAIL]

---

**Common Species (NY):**
- Spotted Salamander
- Blue-spotted Salamander
- Jefferson Salamander
- Red-spotted Newt
- Spring Peeper
- Wood Frog
- American Toad

**When Unsure:**
Use "Unknown Salamander" or "Unknown Frog"

---
```

**Step 3: Commit testing documentation**

```bash
git add docs/volunteer-testing-guide.md docs/volunteer-quick-reference.md
git commit -m "docs: add volunteer testing guide and quick reference"
```

---

## Task 12: Data Analysis Setup

**Files:**
- Create: `analysis/data-quality-check.md`
- Create: `analysis/sample-queries.md`

**Step 1: Create data quality checklist**

File: `analysis/data-quality-check.md`
```markdown
# Data Quality Check - Weekly Review

Run these checks weekly during Phase 1 validation.

## Completeness Check

**Core Fields (should be 100%):**
```sql
-- In Google Sheets, filter for blank cells in these columns:
- PatrolDate (Column B)
- Observer (Column F)
- Species (Column I)
- Count (Column J)
```

**Location Data (should be >95%):**
```sql
- Latitude (Column D)
- Longitude (Column E)
```

**Optional Fields (track completion rate):**
```sql
- Temperature (Column H)
- Notes (Column N)
```

## Validity Check

**Count Ranges:**
- Flag if Count > 100 (likely data entry error)
- Flag if Count = 0

**Species Check:**
- List all unique species values
- Identify misspellings or unexpected entries
- Contact volunteers for clarification

**Date/Time Check:**
- Flag if PatrolDate is in the future
- Flag if PatrolTime is outside expected hours (migration usually evening/night)

**Location Check:**
- Flag if coordinates are (0, 0) - GPS error
- Flag if coordinates are outside expected region
- Verify coordinates make sense (near roads, within study area)

## Consistency Check

**Observer Names:**
- List all unique observer names
- Identify potential duplicates (e.g., "John" vs "John Smith")
- Standardize if needed

**Species Naming:**
- Check for variations ("Wood Frog" vs "wood frog" vs "Woodfrog")
- Standardize capitalization

## Outlier Detection

**Unusual Observations:**
- Very high counts for single observation
- Unexpected species for the region
- Observations far from known migration routes

**Action:** Contact volunteer to confirm, not to correct without verification

## Follow-up Actions

**For Each Issue Found:**
1. Document in "Data Quality Log" sheet
2. Contact observer for clarification (email template below)
3. Update data if confirmed as error
4. Note common errors for Phase 2 validation rules

**Email Template:**
```
Subject: Quick question about your [Date] amphibian patrol

Hi [Observer],

Thank you for submitting data from your patrol on [Date]! We're reviewing the data and had a quick question:

[Specific question about the observation]

Could you confirm if this is correct, or if there might have been a data entry error?

No worries either way - we just want to make sure our data is accurate!

Thanks again for volunteering!

[Your name]
```

## Weekly Summary

**Calculate These Metrics:**
- Total observations this week
- Number of active volunteers
- Species diversity (# unique species)
- Completion rate for each field
- Number of data quality issues
- Response time for issue resolution

**Document in:** `analysis/weekly-reports/YYYY-MM-DD.md`
```

**Step 2: Create sample analysis queries**

File: `analysis/sample-queries.md`
```markdown
# Sample Analysis Queries

Google Sheets formulas and pivot table setups for common analyses.

## Summary Statistics

### Total Observations
```
=COUNTA(I2:I)
```

### Total Individuals (Sum of Count Column)
```
=SUM(J2:J)
```

### Date Range
```
First patrol: =MIN(B2:B)
Last patrol: =MAX(B2:B)
```

### Active Volunteers
```
=UNIQUE(F2:F)
Count: =COUNTA(UNIQUE(F2:F))
```

## Species Analysis

### Species Summary (Pivot Table)
1. Data → Pivot table
2. Rows: Species (Column I)
3. Values:
   - COUNTA of Species (# observations)
   - SUM of Count (# individuals)
4. Sort by count descending

### Top 5 Species
```
Use pivot table from above, limit to top 5 rows
```

### Species by Condition (Pivot Table)
1. Rows: Species
2. Columns: Condition
3. Values: SUM of Count

## Temporal Patterns

### Observations by Date (Chart)
1. Create pivot table: Rows = PatrolDate, Values = COUNTA of Species
2. Insert → Chart → Line chart

### Peak Migration Dates
```
Use pivot table from above, sort by count descending
Top date = peak migration
```

## Volunteer Effort

### Observations per Volunteer (Pivot Table)
1. Rows: Observer
2. Values: COUNTA of Species
3. Sort by count descending

### Most Active Volunteers
```
Use pivot table from above, top 5 rows
```

## Location Hotspots

### Observations by Location
1. Create map visualization (if using Google My Maps):
   - Import lat/lon from sheet
   - Size markers by count
   - Color by species or condition

### Mortality Hotspots
```
Filter Condition column for "Dead"
Map those locations
Identify clusters = high-risk road segments
```

## Weather Correlations

### Species Activity by Weather (Pivot Table)
1. Rows: Weather
2. Columns: Species (or use Values: SUM of Count)
3. Values: SUM of Count

### Temperature Analysis
```
Create bins:
- Cold: <40°F
- Moderate: 40-50°F
- Warm: >50°F

Count observations in each bin
```

## Data Quality Metrics

### Completion Rate - Temperature
```
=COUNTA(H2:H) / COUNTA(B2:B)
Multiply by 100 for percentage
```

### Completion Rate - Notes
```
=COUNTA(N2:N) / COUNTA(B2:B)
```

### Missing GPS Coordinates
```
=COUNTBLANK(D2:D) + COUNTBLANK(E2:E)
```

## Export for Statistical Analysis

### For R or Python
1. File → Download → CSV
2. Import into R/Python for advanced analysis:
   - Generalized linear models (count data)
   - Spatial analysis (hotspot detection)
   - Time series (migration timing)

### Sample R Code
```r
library(tidyverse)

# Load data
data <- read_csv("amphibian_data.csv")

# Species counts
species_summary <- data %>%
  group_by(Species) %>%
  summarize(
    n_observations = n(),
    total_count = sum(Count),
    avg_count = mean(Count)
  ) %>%
  arrange(desc(total_count))

# Migration timing
temporal <- data %>%
  count(PatrolDate) %>%
  ggplot(aes(x = PatrolDate, y = n)) +
  geom_line() +
  labs(title = "Amphibian Road Crossings Over Time")
```

---

**Remember:** These analyses should inform Phase 2 design decisions and demonstrate the value of standardized data collection.
```

**Step 3: Commit analysis documentation**

```bash
git add analysis/
git commit -m "docs: add data quality checks and sample analysis queries"
```

---

## Next Steps After Implementation

### Phase 1 Validation Timeline

**Week 1-2: Usability Testing**
- 3-5 volunteers test forms
- Observe usage, gather feedback
- Iterate on confusing elements

**Week 3-4: Pilot Deployment**
- 10-15 volunteers use during spring migration
- Monitor data submission
- Weekly data quality checks

**Week 5: Analysis & Decision**
- Analyze data completeness and quality
- Review volunteer feedback
- Document lessons learned
- Decide: proceed to Phase 2 or iterate?

### Phase 1 Success Criteria

- ✅ 80%+ volunteers submit at least one patrol
- ✅ 90%+ submissions include core fields
- ✅ 7/10+ ease of use rating
- ✅ Zero data loss from offline usage
- ✅ Data is analyzable and useful

### Transition to Phase 2

When Phase 1 validation is successful:
1. Review design document
2. Plan Phase 2 implementation (PWA + Supabase)
3. Migrate validated data
4. Launch production system

---

**Congratulations!** Phase 1 implementation is complete. The system is ready for volunteer testing.
