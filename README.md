# Amphibian Road Mortality Data Collection - Phase 1

✅ **Status: Phase 1 Complete** - Validation system ready for volunteer testing

A two-phase data collection tool for amphibian road mortality monitoring. Volunteers use a mobile-friendly field form during patrols, then add detailed context later via a detail form.

## Live Deployment

**Landing Page:** https://lbijeau.github.io/cuda/

**Field Form:** https://lbijeau.github.io/cuda/field-form/
Quick capture during patrol - works offline, syncs when online

**Detail Form:** https://lbijeau.github.io/cuda/detail-form/
Add road details, traffic notes, and photos after patrol

## Features

### Field Form
- 📍 GPS location capture
- 🔄 Offline-first with automatic sync
- 📱 Mobile-optimized interface
- 🦎 Multiple observation entries per patrol
- 🌧️ Weather and environmental conditions

### Detail Form
- ✏️ Edit previous observations by observer name
- 🛣️ Add road context (name, speed limit, traffic volume)
- 📝 Additional notes and observations
- 📷 Photo URL linking

### Backend
- Google Sheets storage
- Apps Script API (CORS-compatible GET requests)
- Real-time data availability for analysis

## Project Structure

```
cuda/
├── field-form/          # Mobile field capture interface
│   ├── index.html
│   ├── styles.css
│   └── field-form.js
├── detail-form/         # Desktop detail entry interface
│   ├── index.html
│   ├── detail-form.css
│   └── detail-form.js
├── scripts/
│   └── google-apps-script.js  # Backend API
├── docs/
│   ├── guides/          # Volunteer documentation
│   └── plans/           # Design documents
└── analysis/            # Query templates for data analysis
```

## Setup for New Deployments

1. **Create Google Sheet** with "Observations" sheet
2. **Deploy Apps Script** from `scripts/google-apps-script.js`
   - Execute as: Me
   - Access: Anyone
3. **Update URLs** in `field-form.js` and `detail-form.js`
4. **Deploy** to GitHub Pages or static host

See `scripts/README.md` for detailed setup instructions.

## Documentation

- **Design Document:** `docs/plans/2025-11-19-amphibian-road-mortality-data-collection-design.md`
- **Volunteer Guides:** `docs/guides/`
- **Analysis Queries:** `analysis/sample-queries.md`

## Phase 1 Validation Goals

- [ ] Test with 3-5 volunteers over 2-3 patrol nights
- [ ] Gather usability feedback on two-phase workflow
- [ ] Validate data quality and completeness
- [ ] Identify pain points and improvement areas
- [ ] Document lessons learned for Phase 2 production system

## Technical Notes

- Pure vanilla JavaScript (no framework dependencies)
- CORS workaround: GET requests with URL-encoded JSON
- LocalStorage for offline capability
- Mobile-first responsive design
- No authentication required (Google Sheets as backend)

## License

Educational project - Cornell University group project
