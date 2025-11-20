# Skills Consolidation Script

## Overview

The `consolidateSkills.js` script consolidates all skills from multiple sources into a single, comprehensive skills database that is used throughout the application.

## What It Does

This script:

1. **Extracts all skills from candidates** - Scans every candidate's skill array
2. **Fetches all skills from the Skills database** - Gets skills across all categories
3. **Combines and deduplicates** - Creates a unified list of unique skills
4. **Adds missing skills to database** - Any skill found in candidates but not in the database is added with category "miscellaneous"
5. **Provides comprehensive reporting** - Shows statistics about the consolidation process

## When to Run

Run this script:

- **After importing new candidates** - To ensure their skills are available system-wide
- **Periodically** - To keep the skills database synchronized with candidate data
- **After manual skill additions** - To verify all skills are properly stored
- **During initial setup** - To build the initial comprehensive skills list

## How to Run

### From the backend directory:

```bash
cd backend
node scripts/consolidateSkills.js
```

### With npm (if you add a script to package.json):

```bash
npm run consolidate-skills
```

## Output Example

```
Connecting to MongoDB...
✓ Connected to MongoDB

Step 1: Fetching all skills from Skills database...
✓ Found 245 unique skills in database
  Categories represented: sales-and-business-development, technology-engineering, ...

Step 2: Extracting skills from all candidates...
✓ Found 312 unique skills from 150 candidates
  Total skill entries: 1,245

Step 3: Combining and identifying new skills...
✓ Total unique skills: 387
✓ New skills to add to database: 142

Step 4: Adding new skills to database...
Sample new skills: python, react, node.js, aws, docker, ...
  Added 10 skills...
  Added 20 skills...
  ...
✓ Added 142 new skills to database

Step 5: Generating final consolidated skills list...

=== CONSOLIDATION SUMMARY ===
Total Skills in Database: 387
Skills from Candidates: 312
Skills by Category:
  - miscellaneous: 142
  - technology-engineering: 89
  - sales-and-business-development: 67
  - marketing-communications: 45
  ...

✓ All skills are now consolidated and available system-wide!
✓ These skills will be used everywhere: Add Job, Add Candidate, Filters, etc.

Database connection closed.
```

## What Happens After Running

After running this script:

1. **All skills are in the database** - Every skill from candidates and the original database
2. **Skills are available everywhere** - Add Job, Add Candidate, Filters, Talent Pools, etc.
3. **No category restrictions** - Users can select any skill regardless of category/industry
4. **Consistent experience** - Same comprehensive skill list across all pages

## Technical Details

### Skill Storage

- Skills are stored in the `Skill` collection
- New skills get `category: 'miscellaneous'`
- Skills maintain usage count for popularity sorting
- Case-insensitive deduplication prevents duplicates

### API Integration

The `/api/skills` endpoint automatically returns all consolidated skills:
- No category filtering by default
- Sorted by usage count (most used first)
- Then alphabetically
- Available to all authenticated users

### Frontend Integration

All frontend components fetch skills from the same endpoint:
- `AddCandidate.jsx` - Gets all skills on mount
- `AddJob.jsx` - Gets all skills on mount
- `CandidateFilter.jsx` - Uses skills from parent component
- `TalentPools.jsx` - Gets all skills on mount

## Troubleshooting

### "No users found in database"

If you see this warning, skills will still be added but without organization/createdBy metadata. This is fine for functionality but you may want to create a user first.

### "Skill already exists"

This is normal - the script checks for existing skills and skips them to prevent duplicates.

### Database connection errors

Ensure:
- MongoDB is running
- `.env` file has correct `MONGODB_URI`
- You're running from the backend directory

## Maintenance

### Regular Consolidation

Consider running this script:
- **Weekly** - If you frequently import candidates
- **After bulk imports** - Always run after using bulk import scripts
- **Monthly** - For general maintenance

### Monitoring

Check the output for:
- Number of new skills added
- Skills by category distribution
- Any error messages

## Related Files

- `backend/controllers/skillController.js` - API endpoint that serves consolidated skills
- `frontend/src/components/AddCandidate.jsx` - Uses consolidated skills
- `frontend/src/components/AddJob.jsx` - Uses consolidated skills
- `backend/bulkImportCandidates.js` - Import script that adds candidate data


