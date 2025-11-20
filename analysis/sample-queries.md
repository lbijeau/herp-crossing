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
