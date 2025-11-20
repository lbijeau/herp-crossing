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
