// Configuration
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxUiYSR-l4geLWNsuSKxpTGyJl09ck6zU7iPF0pOlX5ZynjJlFyAheTH0SQmviKCcvjCA/exec'; // TODO: Update after deployment

// State
let observations = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    setupEventListeners();
    checkOnlineStatus();

    if (navigator.onLine) {
        syncOfflinePatrols();
    }
});

// Check for offline patrols when coming back online
window.addEventListener('online', () => {
    checkOnlineStatus();
    syncOfflinePatrols();
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

// Observation entry management
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

// Offline storage
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

// Form submission
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
