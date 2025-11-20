// Configuration
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxUiYSR-l4geLWNsuSKxpTGyJl09ck6zU7iPF0pOlX5ZynjJlFyAheTH0SQmviKCcvjCA/exec'; // TODO: Update

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
