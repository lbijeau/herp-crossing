# Scripts Directory

## Google Apps Script Setup

### Instructions

1. Create a new Google Sheet for data collection
2. Name it "Amphibian Road Crossings - Phase 1 Data"
3. Tools → Script editor
4. Copy `google-apps-script.js` into the script editor
5. Save and deploy as web app
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the deployment URL
7. Update `APPS_SCRIPT_URL` in both `field-form/field-form.js` and `detail-form/detail-form.js`

### Endpoints

- `GET ?action=submit&data=<JSON>` - Submit field observations
- `GET ?action=getPatrols&observer=<name>` - Fetch patrols for observer
- `GET ?action=update&data=<JSON>` - Update patrol details

**Note:** All endpoints use GET requests to avoid CORS preflight issues.

---

## Data Backup Script

### backup-data.sh

Downloads observation data from the Google Apps Script API for backup/archival.

#### Requirements

- `curl` (for API requests)
- `jq` (for JSON parsing) - Install: `brew install jq` (macOS)

#### Usage

**Interactive mode:**
```bash
./scripts/backup-data.sh
```

**Backup specific observer:**
```bash
./scripts/backup-data.sh "Jane Smith"
```

**Batch backup multiple observers:**
```bash
./scripts/backup-data.sh --batch
```

**List existing backups:**
```bash
./scripts/backup-data.sh --list
```

**Help:**
```bash
./scripts/backup-data.sh --help
```

#### Output

Backups are saved to `backups/` directory as JSON files:
```
backups/observations_Jane_Smith_20251120_143022.json
```

Each backup includes:
- All patrol sessions for the observer
- Complete observation data
- Timestamps and metadata

#### Limitations

- Can only fetch data by observer name (API limitation)
- For full dataset backup, use Google Sheets: File → Download → CSV

#### Use Cases

- **Regular backups:** Run weekly during Phase 1 testing
- **Data migration:** Export before upgrading to Phase 2
- **Data analysis:** Download for offline analysis in R/Python
- **Safety net:** Backup before making sheet changes

---

## Future Scripts

Potential additions for Phase 1:

- `validate-data.sh` - Check for data quality issues
- `generate-report.sh` - Create summary statistics
- `export-csv.sh` - Convert JSON backups to CSV
