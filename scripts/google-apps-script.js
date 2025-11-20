// Amphibian Road Mortality - Google Apps Script API
// Deploy as web app: Execute as "Me", Access "Anyone"

// Handle CORS preflight requests
function doOptions(e) {
  return ContentService
    .createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setContent('{}');
}

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
  } else if (action === 'submit') {
    // Handle submit via GET to avoid CORS issues
    return handleSubmitGet(e);
  }

  return jsonResponse({ error: 'Unknown action' }, 400);
}

function handleSubmitGet(e) {
  try {
    // Parse data from URL parameter
    const data = JSON.parse(e.parameter.data);
    return processSubmission(data);
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function handleSubmit(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    return processSubmission(data);
  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function processSubmission(data) {
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
