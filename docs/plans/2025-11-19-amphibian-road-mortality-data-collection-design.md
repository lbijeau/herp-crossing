# Amphibian Road Mortality Data Collection System - Design Document

**Date:** November 19, 2025
**Project:** Standardized data collection tool for amphibian road crossing volunteers
**Team:** Cornell University undergraduate group project
**Status:** Design approved, ready for implementation

---

## Executive Summary

### Problem
Volunteers help amphibians cross roads during spring and fall breeding migrations, but data collection is inconsistent and non-standardized across volunteer groups. This makes it difficult to compare efforts, conduct research, or inform conservation actions.

### Solution
A two-phase standardized data collection system:
- **Phase 1 (Validation):** Simple web forms + Google Sheets to test workflow with real volunteers
- **Phase 2 (Production):** Progressive Web App with offline capability, cloud database, and multi-organization support

### Success Criteria
1. High volunteer adoption and consistent use
2. Research-quality data suitable for publication
3. Adoption by volunteer groups beyond Cornell

### Key Innovation
Two-phase data entry (quick field capture + detailed later entry) that balances scientific rigor with realistic field conditions.

---

## 1. Two-Phase Approach & Overall Architecture

### Phase 1: Validation (2-4 weeks)

**Purpose:** Test workflow and data model with real volunteers before investing in full system.

**Components:**
- **Field capture:** Simple mobile web form (HTML/CSS/JavaScript)
- **Data storage:** Google Sheets (free, familiar, easy to analyze)
- **Detailed entry:** Web form for adding details after field work

**Validation goals:**
- Test with 10-15 volunteers during spring migration
- Discover which data fields they actually complete vs skip
- Learn whether two-phase workflow works
- Confirm GPS accuracy and privacy needs
- Identify confusion points and errors

### Phase 2: Production System

**Transition criteria:**
- Workflow validated with volunteers
- Data model confirmed
- Privacy requirements understood
- Hosting/funding secured

**Components:**
- **Frontend:** Progressive Web App (React/Vue, works offline, installable)
- **Backend:** Supabase or Firebase (PostgreSQL, auth, real-time)
- **Features:** Data validation, offline sync, role-based access, export, analytics

**Migration path:** Export validated data from Sheets, import to new database. Volunteers switch to new URL.

---

## 2. Phase 1 - Field Form & Data Model

### Field Form (Mobile Web)

Single HTML page that volunteers bookmark on phone home screen.

**Session fields (entered once per patrol):**
- Date/time (auto-filled, editable)
- Location (GPS button - "Get my location")
- Observer name/ID (saved in browser, auto-fills)
- Weather dropdown (Clear/Cloudy/Rain/Fog)
- Temperature (optional, from phone or manual)

**Per-observation fields (repeatable):**
- Species (dropdown with common names + "Unknown")
- Count (number input)
- Life stage (Adult/Juvenile/Egg mass)
- Direction (To breeding site/From breeding site/Unclear)
- Condition (Alive-helped/Alive-already crossed/Dead/Injured)
- Notes (optional text field)

**Form behavior:**
- "Add another observation" button (log multiple species per stop)
- "Submit patrol" sends all data to Google Sheet
- Shows "Submitted!" confirmation, clears for next patrol
- If offline, saves to browser LocalStorage with "Will submit when online" message

### Google Sheet Structure

**One row per observation** (not per patrol)

**Columns:**
- SubmitTime, PatrolDate, PatrolTime
- Location (lat/lon), Observer
- Weather, Temperature
- Species, Count, LifeStage, Direction, Condition
- Notes

---

## 3. Phase 1 - Detailed Entry & Data Refinement

### Detail Form (Web Interface)

Shows volunteer's recent submissions for refinement and additional details.

**Features:**
- Fetch volunteer's recent patrols from Sheets
- Click to edit and add:
  - Road details (name, speed limit, traffic volume)
  - Effort data (start/end time, distance covered, number of volunteers)
  - Species confirmation (if looked up later)
  - Photo links (uploaded to Google Drive)
- Updates Google Sheet rows

**Why detail form over direct sheet editing:**
- Prevents accidental data corruption
- Provides guided interface
- Validates data entry
- Better user experience for non-technical volunteers

### Data Validation During Phase 1

**Weekly quality checks:**
- Student team reviews incomplete entries and outliers
- Reach out to volunteers to clarify unusual observations
- Document common errors → inform Phase 2 validation rules
- Track completion rates per field → identify what's too hard to capture

---

## 4. Phase 1 - Technical Implementation

### Tech Stack

**Field Form:**
- Plain HTML/CSS/JavaScript (no framework needed)
- Geolocation API for GPS coordinates
- LocalStorage for offline submissions
- Deployed on GitHub Pages (free)

**Detail Form:**
- Same tech stack, separate page
- Fetches volunteer's recent submissions from Sheets

**Google Sheets Integration:**
- Google Apps Script as middleware API
- Three endpoints:
  - `POST /submit` - field form posts observation data
  - `GET /my-patrols?observer=X` - detail form fetches data
  - `PUT /update-patrol` - detail form updates rows
- Simple authentication (API key or volunteer email)

### File Structure

```
/field-form
  index.html          # Quick capture interface
  styles.css
  field-form.js       # GPS, offline, submit logic

/detail-form
  index.html          # Review & add details
  styles.css
  detail-form.js      # Fetch, edit, update

/scripts
  google-apps-script.js  # Sheets API endpoints
```

### Team Responsibilities

- **Web dev students:** HTML forms and JavaScript
- **Backend students:** Google Apps Script API
- **Data science students:** Sheet analysis and validation queries
- **Non-coders:** User testing, documentation, volunteer coordination

---

## 5. Phase 2 - Production System Architecture

### Frontend (Progressive Web App)

**Technology:**
- React or Vue.js (state management, component reuse)
- Tailwind CSS (responsive design)
- Service worker (offline functionality)
- Installable to phone home screen

**Why PWA:**
- Works on any device without app store approval
- Single codebase for all platforms
- Easy to share (just a URL)
- Offline-first capability
- Can access GPS, camera, etc.

### Backend (Cloud Database)

**Recommended: Supabase**
- PostgreSQL database (relational, powerful queries)
- Built-in authentication (email, Google sign-in)
- Row-level security (data privacy at database level)
- Real-time subscriptions (see live updates)
- Auto-generated RESTful API
- File storage (for photos)
- **Free tier:** 500MB database, 2GB storage, 50k monthly active users

**Alternative: Firebase**
- Similar features, NoSQL database
- Excellent offline support
- Good documentation

### Database Schema

```sql
-- Patrol sessions
patrols
  id (uuid, primary key)
  observer_id (foreign key → users)
  organization_id (foreign key → organizations)
  date, start_time, end_time
  start_location (geography point)
  weather, temperature
  road_name, road_segment_id
  notes

-- Individual sightings
observations
  id (uuid, primary key)
  patrol_id (foreign key → patrols)
  timestamp
  species_id (foreign key → species)
  count, life_stage
  direction, condition
  precise_location (geography point, nullable)
  notes
  photo_urls (array)
  validated (boolean)
  validator_id (foreign key → users, nullable)

-- Reference data
species
  id (uuid, primary key)
  common_name, scientific_name
  sensitivity_level (public/protected/sensitive)
  description, photo_url

-- User management
users
  id (uuid, primary key)
  name, email
  role (volunteer/coordinator/researcher/admin)
  organization_id (foreign key → organizations)
  experience_level

-- Multi-tenancy
organizations
  id (uuid, primary key)
  name, description
  location, contact_info
  custom_species_list (boolean)
  data_sharing_policy
```

---

## 6. Phase 2 - Key Features & Capabilities

### Field App (PWA) Features

**Offline-first architecture:**
- All forms work without internet connection
- Automatic sync when connection returns
- Clear sync status ("3 patrols waiting to sync")
- Conflict resolution for concurrent edits

**Smart data entry:**
- Species autocomplete with photos for ID help
- "Repeat last observation" button (same species seen again)
- Weather auto-filled from previous entry in session
- GPS tracks route automatically, marks observation points
- Voice notes option (transcribed later or attached as audio)
- Photo capture with automatic linking to observations

**Data validation:**
- Required fields highlighted before submit
- Range checks (count must be 1-1000, temperature reasonable, etc.)
- Warning for sensitive species ("Location will be obscured in public data")
- Duplicate detection ("You logged spotted salamanders here 2 min ago")
- Species/location mismatch warnings (unexpected species for region)

### Detail Entry (Web Dashboard)

**Review interface:**
- Map view of all patrols (clustered markers)
- Filter by date range, species, location, validation status
- Bulk edit multiple observations
- Upload photos, link to observations
- Flag uncertain IDs for expert review
- Export personal data for records

**Collaboration features:**
- Multiple volunteers can join a patrol session
- See what other teams logged tonight (real-time updates)
- Comment on observations ("Can confirm - I saw this too")
- Mention other volunteers for review

### For Researchers

**Data access:**
- Export to CSV, Excel, Darwin Core format
- API access for programmatic queries
- Public dataset (with privacy filters applied)
- Private dataset for approved researchers (full precision)
- Query builder interface (no SQL needed)

**Analysis tools:**
- Summary dashboards (species counts over time)
- Hotspot maps (heat maps of high mortality areas)
- Effort tracking (volunteer hours, road coverage)
- Data quality metrics (completion rates, validation status)
- Temporal patterns (peak migration dates, weather correlations)
- Comparative analysis across regions/years

---

## 7. Data Privacy & Access Control

### Privacy Tiers

**Tier 1 - Public Data:**
- Location rounded to ~1km grid cell
- Sensitive species filtered out or shown as "Sensitive species"
- Available to anyone via website or bulk download
- **Use cases:** Education, general awareness, broad patterns

**Tier 2 - Research Data:**
- Location precise to ~100m
- All species included with sensitivity flags
- Available to approved researchers (request access process)
- **Use cases:** Academic studies, conservation planning

**Tier 3 - Full Data:**
- Exact GPS coordinates
- All observations including uncertain IDs and photos
- Available to: Data collectors, project admins, trusted collaborators
- **Use cases:** Data validation, detailed analysis, returning to exact sites

### User Roles & Permissions

**Volunteer (Field Observer):**
- Submit observations via field app
- Edit own observations (within 48 hours)
- View own patrol history
- See aggregated summaries (Tier 1 data)

**Volunteer Coordinator:**
- All volunteer permissions
- View all patrols from their organization
- Validate/flag observations for quality
- Manage volunteer roster
- Export organization data (Tier 2)

**Researcher:**
- Request access to Tier 2 data (approved by admins)
- Export datasets with attribution requirements
- Cannot edit observations
- Can comment/request clarifications
- Must cite data source in publications

**Admin (Student team, later: program managers):**
- Full access (Tier 3)
- Manage users and permissions
- Configure species sensitivity levels
- Export all data formats
- System configuration and monitoring

### Species Sensitivity Configuration

- Maintained in species reference table
- Fields: `sensitivity_level` (public/protected/sensitive)
- Can be updated as conservation status changes
- Applied automatically when serving public data
- Reviewed annually or when new species added
- Coordinates with state wildlife agencies for guidance

---

## 8. Adoption Strategy & Sustainability

### Multi-Tenancy Design

**Organization isolation:**
- Each volunteer group gets own "organization" workspace
- Own volunteer roster, patrols, and data
- Can share data with other orgs (opt-in)
- Can collaborate on shared road segments

**Customization options:**
- Custom species lists (regional differences)
- Custom road segment definitions
- Optional additional data fields
- Branding (logo, colors) for white-label use

### Onboarding New Organizations

**Self-service setup:**
1. "Create new organization" registration
2. Setup wizard:
   - Upload species list or use default
   - Define road segments (map interface)
   - Configure data fields and privacy settings
   - Invite initial volunteers
3. **Time:** 30 minutes, not 30 hours

**Support materials:**
- Video walkthrough of setup process
- Template species lists by region
- Example road segment configurations

### Documentation

**For volunteers:**
- 2-minute video: "How to log your first patrol"
- One-page quick reference card (printable, laminated)
- FAQ addressing common confusion points
- Troubleshooting guide (learned from Phase 1)

**For coordinators:**
- Setup guide with screenshots
- Data export and analysis tutorials
- Volunteer management best practices
- Quality control guidelines

**For developers:**
- Open source the code (GitHub, MIT license)
- Architecture documentation (this document + technical specs)
- Deployment guide for self-hosting
- API documentation for integrations
- Contributing guide for community development

### Spreading the Word

**Academic channels:**
- Present at Cornell ecology seminars
- Submit to undergraduate research conferences
- Publish case study in conservation technology journals
- Share on citizen science networks (CitSci.org, SciStarter)

**Conservation networks:**
- Contact existing amphibian patrol groups in Northeast
- Present at Partners in Amphibian and Reptile Conservation (PARC) meetings
- Collaborate with state wildlife agencies
- Connect with Amphibian Survival Alliance

**Marketing materials:**
- Case study: "We improved data completeness by X%"
- Volunteer testimonials: "So much easier than paper forms"
- Sample data visualizations showing conservation insights
- Impact stories (roads modified based on data)

### Long-term Sustainability

**Technical maintenance:**
- Document code thoroughly for handoff
- Use stable, well-supported technologies
- Automate deployments and backups
- Plan for data archival (10+ year horizon)

**Organizational sustainability:**
- Identify Cornell lab/department to steward long-term
- Build community of volunteer coordinators
- Establish governance model for multi-org participation
- Create sustainability plan (hosting costs, development priorities)

---

## 9. Testing, Validation & Success Metrics

### Phase 1 Validation

**Usability testing (Weeks 1-2):**
- 3-5 volunteers test field form during practice run
- **Method:** Observe them using it (don't just ask - watch)
- **Measure:** Time to log one observation, error rate, fields skipped
- **Ask:** "What was confusing?" "What would you change?"
- **Outcome:** Iterate on form design before real deployment

**Pilot deployment (Weeks 3-4):**
- 10-15 volunteers use during actual spring migration patrols
- Compare data completeness vs. previous years (if data exists)
- **Track:** Submission rate, offline success rate, detail form usage
- **Survey:** "Would you use this again?" (Net Promoter Score)

**Phase 1 Success Criteria:**
- ✅ 80%+ of volunteers submit at least one patrol
- ✅ 90%+ of submissions include core fields (species, count, location)
- ✅ Volunteers rate it 7/10 or higher for ease of use
- ✅ Zero data loss from offline usage
- ✅ Students can analyze data (it's in usable format)

### Phase 2 Quality Assurance

**Before launch:**
- **Automated tests:** Offline sync, data validation, privacy filters
- **Security review:** User authentication, sensitive species data protection
- **Load testing:** Can it handle 100 concurrent volunteers?
- **Cross-browser/device testing:** iOS Safari, Android Chrome, older devices
- **Accessibility testing:** Screen readers, keyboard navigation
- **Beta testing:** 20-30 volunteers from multiple organizations

**After launch:**
- **Error monitoring:** Sentry or similar (catch bugs in production)
- **Usage analytics:** Which features used vs ignored (privacy-respecting)
- **Regular data quality audits:** Random sample validation
- **Volunteer feedback cycles:** Monthly surveys, quarterly focus groups
- **Performance monitoring:** Page load times, sync speed, uptime

### Long-term Success Metrics

**Adoption metrics:**
- Number of active volunteer groups (target: 10 in year 1, 50 in year 3)
- Number of patrols logged per season (benchmark against prior years)
- Geographic coverage (how many regions/states)
- Volunteer retention rate (return volunteers year-over-year)

**Data quality metrics:**
- Percentage of observations with complete data (target: >90%)
- Species ID validation rate (expert confirms ID) (target: >95%)
- Data suitable for publication (used in peer-reviewed research papers)
- Inter-observer reliability (same species identified consistently)

**Impact metrics:**
- Conservation actions informed by the data (road modifications, signage)
- Road mortality trends identified (declining? stable? increasing?)
- High-risk crossing locations protected (fencing, tunnels)
- Policy changes influenced (wildlife crossing regulations)
- Publications using the data (journal articles, theses)

---

## 10. Implementation Roadmap

### Phase 1: Validation (4-6 weeks)

**Week 1:**
- Set up project repository (GitHub)
- Build field form HTML/CSS/JavaScript
- Set up Google Sheet and Apps Script API
- Deploy to GitHub Pages

**Week 2:**
- Build detail form interface
- Usability testing with 3-5 volunteers
- Iterate based on feedback

**Week 3-4:**
- Pilot deployment with 10-15 volunteers during migration
- Monitor submissions and provide support
- Collect feedback surveys

**Week 5-6:**
- Analyze data and feedback
- Document lessons learned
- Decide: proceed to Phase 2 or iterate?

### Phase 2: Production System (3-4 months)

**Month 1: Foundation**
- Set up Supabase project and database schema
- Build authentication and user management
- Create basic PWA shell with offline support
- Implement field form in React/Vue

**Month 2: Core Features**
- Build detail entry dashboard
- Implement data validation rules
- Add privacy tier filtering
- Create organization management

**Month 3: Advanced Features**
- Real-time collaboration
- Analytics dashboards
- Data export and API
- Photo upload and management

**Month 4: Testing & Launch**
- Beta testing with multiple organizations
- Security and performance testing
- Documentation and training materials
- Public launch and outreach

---

## Next Steps

### Immediate Actions

1. **Research existing tools** (2-3 hours)
   - Look at iNaturalist, eBird, Epicollect5, KoBoToolbox
   - Identify patterns to learn from or avoid
   - Confirm nothing exists that already solves this

2. **Consult ecology experts** (1-2 conversations)
   - Confirm data fields are scientifically useful
   - Understand species sensitivity requirements
   - Get advice on volunteer engagement

3. **Assemble team and assign roles**
   - Web dev: field and detail forms
   - Backend: Google Apps Script
   - Data science: analysis and validation
   - Non-coders: testing and documentation

4. **Set up development environment**
   - Create GitHub repository
   - Set up Google Sheet template
   - Configure GitHub Pages for deployment

### Ready to Build?

When you're ready to move from design to implementation, we can:
- Create detailed implementation plan with specific tasks
- Set up git repository and project structure
- Build Phase 1 prototypes
- Create volunteer testing protocol

---

## Appendix: Design Decisions & Trade-offs

### Why two-phase data entry?
- **Problem:** Can't expect comprehensive data entry while helping amphibians cross a busy road at night
- **Solution:** Quick essential capture in field, detailed refinement when safe
- **Trade-off:** More complex workflow, but much higher data quality and volunteer safety

### Why PWA instead of native app?
- **Benefits:** Works on any device, no app store approval, easier to maintain, just a URL to share
- **Trade-offs:** Slightly less smooth UX than native, depends on browser support
- **Decision:** Benefits outweigh costs for citizen science tool targeting widespread adoption

### Why start with Google Sheets?
- **Benefits:** Free, familiar, easy to analyze, quick to build, validates workflow before heavy investment
- **Trade-offs:** Not scalable long-term, limited validation, collaboration challenges
- **Decision:** Perfect for validation phase, not for production

### Why Supabase over Firebase?
- **Supabase:** PostgreSQL (relational, powerful queries), open source, easier data export, row-level security
- **Firebase:** Better offline support, more mature, excellent documentation
- **Decision:** Slight preference for Supabase for research data (SQL queries), but either works

### Why multi-tenancy from the start?
- **Benefits:** Enables adoption by other groups without code changes, builds network effects
- **Trade-offs:** More complex architecture, harder to build initially
- **Decision:** Critical for "adoption beyond Cornell" success criterion, worth the investment

---

## Implementation Notes - Phase 1 Complete

### Completed: November 20, 2025

**Status:** ✅ Phase 1 validation system fully implemented and deployed

### What Was Built

#### Field Form (`field-form/`)
- Mobile-first responsive design with GPS capture
- Dynamic observation entries (add/remove species during patrol)
- Offline-first architecture using LocalStorage
- Automatic sync when returning online
- Species dropdown with common amphibians
- Weather and temperature tracking
- Session data persistence (remembers observer name)

**Live:** https://lbijeau.github.io/cuda/field-form/

#### Detail Form (`detail-form/`)
- Load observations by observer name
- Visual patrol cards showing basic/detailed status
- Edit interface for adding road context:
  - Road name and speed limit
  - Traffic volume assessment
  - Additional notes
  - Photo URL linking
- Structured notes format (appends to existing notes)

**Live:** https://lbijeau.github.io/cuda/detail-form/

#### Backend (`scripts/google-apps-script.js`)
- Three API endpoints: submit, getPatrols, update
- Google Sheets as data store ("Observations" sheet, 14 columns)
- CORS-compatible: GET requests with URL-encoded JSON payloads
- Real-time data availability (no caching)

### Technical Decisions Made

1. **CORS Workaround**: Switched from POST to GET requests with data in URL parameters to avoid CORS preflight (OPTIONS) requests, which Google Apps Script doesn't support

2. **Vanilla JavaScript**: No framework dependencies - reduces complexity, ensures offline capability, faster load times

3. **No Authentication**: Appropriate for Phase 1 validation, observer name serves as identifier

4. **LocalStorage for Offline**: Simple, reliable, works across all mobile browsers

5. **Structured Notes Format**: Phase 1 uses single notes field with formatted text rather than separate columns - allows flexibility for Phase 2 schema design

### Known Limitations (Expected for Phase 1)

- No data validation beyond required fields
- No photo upload (URLs only)
- No batch editing capabilities
- Limited privacy controls (all data visible to sheet owner)
- Observer name not authenticated
- No data export tools (use Google Sheets directly)
- Notes field may need parsing for Phase 2 migration

### Deployment Architecture

```
GitHub Pages (Static Host)
  ↓
  field-form.js / detail-form.js (Browser)
  ↓
  GET requests with URL params
  ↓
  Google Apps Script (Deployed Web App)
  ↓
  Google Sheets API
  ↓
  "Observations" Sheet (14 columns)
```

### Lessons Learned

1. **CORS is complex**: Google Apps Script has limitations. GET-based API avoided days of CORS debugging.

2. **Offline-first is critical**: Field conditions (forests, rural roads) require offline capability from day one.

3. **Two-phase workflow validated**: Separate forms for field/detail entry is architecturally sound.

4. **Keep Phase 1 simple**: Resisted feature creep. Validation focused on core workflow only.

### Ready for Validation Testing

**Next Steps:**
- [ ] Test with 3-5 volunteers over 2-3 patrol nights
- [ ] Gather usability feedback via post-patrol interviews
- [ ] Analyze data completeness and quality
- [ ] Document pain points and improvement areas
- [ ] Create lessons learned document for Phase 2 design

### Files Created

```
Repository: https://github.com/lbijeau/cuda

Core Implementation:
- field-form/index.html, styles.css, field-form.js (420 lines)
- detail-form/index.html, detail-form.css, detail-form.js (221 lines)
- scripts/google-apps-script.js (172 lines)
- index.html (landing page)

Documentation:
- docs/guides/field-form-guide.md
- docs/guides/detail-form-guide.md
- analysis/sample-queries.md
- README.md (comprehensive project overview)
- scripts/README.md (deployment instructions)
```

### Data Schema Implemented

**Google Sheets Columns (14):**
1. SubmitTime (timestamp)
2. PatrolDate (date)
3. PatrolTime (time)
4. Latitude (decimal)
5. Longitude (decimal)
6. Observer (text)
7. Weather (text)
8. Temperature (number)
9. Species (text)
10. Count (number)
11. LifeStage (text)
12. Direction (text)
13. Condition (text)
14. Notes (text)

**Note:** One row per observation (not per patrol session). Multiple observations from same patrol share session data.

---

**Document Version:** 1.1 (Phase 1 Implementation Complete)
**Last Updated:** November 20, 2025
**Next Review:** After Phase 1 validation testing with volunteers
