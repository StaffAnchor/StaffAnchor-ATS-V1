const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('../models/Candidate');
const Skill = require('../models/Skill');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

/**
 * This script consolidates all skills from:
 * 1. All candidates' skill arrays
 * 2. All skills in the Skills database (across all categories)
 * 
 * It creates a comprehensive, deduplicated list and ensures all skills
 * are stored in the Skills database with 'miscellaneous' category if not already present.
 */

async function consolidateSkills() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Step 1: Get all skills from the Skills database
    console.log('Step 1: Fetching all skills from Skills database...');
    const dbSkills = await Skill.find({});
    const dbSkillsSet = new Set();
    const dbSkillsMap = new Map();
    
    dbSkills.forEach(skill => {
      const skillNameLower = skill.name.toLowerCase().trim();
      dbSkillsSet.add(skillNameLower);
      dbSkillsMap.set(skillNameLower, skill);
    });
    
    console.log(`✓ Found ${dbSkillsSet.size} unique skills in database`);
    console.log(`  Categories represented: ${[...new Set(dbSkills.map(s => s.category))].join(', ')}\n`);

    // Step 2: Get all skills from all candidates
    console.log('Step 2: Extracting skills from all candidates...');
    const candidates = await Candidate.find({}, { skills: 1, name: 1 });
    const candidateSkillsSet = new Set();
    
    let candidatesWithSkills = 0;
    let totalSkillsFromCandidates = 0;
    
    candidates.forEach(candidate => {
      if (Array.isArray(candidate.skills) && candidate.skills.length > 0) {
        candidatesWithSkills++;
        candidate.skills.forEach(skill => {
          if (skill && typeof skill === 'string' && skill.trim() !== '') {
            const skillNameLower = skill.toLowerCase().trim();
            candidateSkillsSet.add(skillNameLower);
            totalSkillsFromCandidates++;
          }
        });
      }
    });
    
    console.log(`✓ Found ${candidateSkillsSet.size} unique skills from ${candidatesWithSkills} candidates`);
    console.log(`  Total skill entries: ${totalSkillsFromCandidates}\n`);

    // Step 3: Combine and identify new skills
    console.log('Step 3: Combining and identifying new skills...');
    const allSkillsSet = new Set([...dbSkillsSet, ...candidateSkillsSet]);
    const newSkills = [...candidateSkillsSet].filter(skill => !dbSkillsSet.has(skill));
    
    console.log(`✓ Total unique skills: ${allSkillsSet.size}`);
    console.log(`✓ New skills to add to database: ${newSkills.length}\n`);

    if (newSkills.length > 0) {
      console.log('Step 4: Adding new skills to database...');
      console.log('Sample new skills:', newSkills.slice(0, 10).join(', '));
      console.log('');
      
      // Get a default organization and user for new skills
      // Try to find an admin user first, otherwise any user
      const User = require('../models/User');
      let defaultUser = await User.findOne({ accessLevel: 2 });
      if (!defaultUser) {
        defaultUser = await User.findOne();
      }
      
      if (!defaultUser) {
        console.log('⚠ No users found in database. Skills will be created without organization/createdBy.');
      }

      let addedCount = 0;
      let skippedCount = 0;
      
      for (const skillName of newSkills) {
        try {
          // Double-check if skill exists (case-insensitive)
          const existingSkill = await Skill.findOne({
            name: { $regex: new RegExp(`^${skillName}$`, 'i') }
          });
          
          if (existingSkill) {
            skippedCount++;
            continue;
          }
          
          const newSkill = new Skill({
            name: skillName,
            category: 'miscellaneous',
            organization: defaultUser?.organization || 'default',
            createdBy: defaultUser?._id,
            isCustom: true,
            usageCount: 0
          });
          
          await newSkill.save();
          addedCount++;
          
          if (addedCount % 10 === 0) {
            console.log(`  Added ${addedCount} skills...`);
          }
        } catch (err) {
          console.error(`  ✗ Error adding skill "${skillName}":`, err.message);
        }
      }
      
      console.log(`\n✓ Added ${addedCount} new skills to database`);
      if (skippedCount > 0) {
        console.log(`⊘ Skipped ${skippedCount} skills (already existed)`);
      }
    } else {
      console.log('✓ No new skills to add - all candidate skills are already in database\n');
    }

    // Step 5: Generate final consolidated list
    console.log('Step 5: Generating final consolidated skills list...');
    const finalSkills = await Skill.find({}).sort({ usageCount: -1, name: 1 });
    
    console.log('\n=== CONSOLIDATION SUMMARY ===');
    console.log(`Total Skills in Database: ${finalSkills.length}`);
    console.log(`Skills from Candidates: ${candidateSkillsSet.size}`);
    console.log(`Skills by Category:`);
    
    const categoryCount = {};
    finalSkills.forEach(skill => {
      categoryCount[skill.category] = (categoryCount[skill.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}`);
    });
    
    console.log('\n✓ All skills are now consolidated and available system-wide!');
    console.log('✓ These skills will be used everywhere: Add Job, Add Candidate, Filters, etc.');

  } catch (err) {
    console.error('Fatal error during consolidation:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
}

// Run the consolidation
consolidateSkills();


