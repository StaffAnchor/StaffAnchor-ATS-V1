const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('./models/Candidate');
const Skill = require('./models/Skill');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

// Candidate data from the spreadsheet
// REPLACE THIS ARRAY WITH YOUR NEW CANDIDATE DATA
const candidatesData = [
  {
    firstName: "TEJASWINI",
    lastName: "B RAO",
    email: "myselftejaswini@gmail.com",
    phone: "+91-9741556612",
    skills: "AutoCAD, SketchUp, Enscape, VRay"
  },
  {
    firstName: "HEENA",
    lastName: "SHAIKH",
    email: "heenashaikhh60@gmail.com",
    phone: "6361559070",
    skills: "AUTO CAD, MS-OFFICE, SKETCHUP PRO, ENSCAPE"
  },
  {
    firstName: "Muhammad",
    lastName: "Asmar",
    email: "am8035212@gmail.com",
    phone: "+971 56 771 7691",
    skills: "3ds Max, AutoCAD, Corona Renderer, Lumion, Chaos Vantage, Twinmotion, Adobe After Effects, Adobe Photoshop, Adobe Premiere Pro, Adobe Illustrator, Autocad, Autodesk 3ds Max"
  },
  {
    firstName: "AMAAN",
    lastName: "MUHAMMED",
    email: "amanjaleel9@gmail.com",
    phone: "+91 8547762499",
    skills: "MEP Systems Design & Coordination, HVAC Design & Load Calculations (HAP), Piping Layouts & Isometric Drafting, Cost Optimization & Resource Management, Plumbing & Firefighting Layouts (AutoCAD / Revit MEP), Technical Documentation & Reports, Health, Safety & Environmental Compliance (HSE), Project Coordination & Team Collaboration, Problem Solving & Analytical Skills, AutoCAD (2D Drafting & Layouts), Revit MEP (BIM Modeling), HAP (Hourly Analysis Program), Risk Assessment Frameworks, Safety Compliance Tools & Incident Reporting"
  },
  {
    firstName: "Devank",
    lastName: "Pandey",
    email: "devankpandey40@gmail.com",
    phone: "09759195216",
    skills: "Diploma in computer Applications, Assistant electrician"
  },
  {
    firstName: "SHRISHTI",
    lastName: "Shrishti",
    email: "shrishti7858@gmail.com",
    phone: "9811715926",
    skills: "hrm - human resource management"
  },
  {
    firstName: "Meet",
    lastName: "Thakkar",
    email: "tmeet55@gmai.com",
    phone: "8983387369",
    skills: "B2B Sales, leadership and team management, account development and retention, revenue growth strategy"
  },
  {
    firstName: "Sarvesh",
    lastName: "Yadav",
    email: "sarveshyadav071998@gmail.com",
    phone: "9871669891",
    skills: ""
  },
  {
    firstName: "Aman",
    lastName: "Kansal",
    email: "amankansal456@gmail.com",
    phone: "9910333491",
    skills: "Sales"
  },
  {
    firstName: "VIKAS",
    lastName: "BALIYAN",
    email: "vikasbaliyan0@gmail.com",
    phone: "+91-9220473199",
    skills: "MS Word, Excel, Powerpoint, Business Development, Sales"
  },
  {
    firstName: "Amit",
    lastName: "Uttekar",
    email: "amituttekar1987@gmail.com",
    phone: "8446211871",
    skills: "leadership and team management, B2b, National sales manager, Zonal Sales Manager, Franchise, Edtech, revenue growth generation, top-line growth champion, profit & loss analysis, Leadership, building new business, business process modeling"
  },
  {
    firstName: "BRAJESH",
    lastName: "YADAV",
    email: "brijeshyadav.100@rediffmail.com",
    phone: "+916263755642",
    skills: "Excellent customer service, Extensive knowledge of the FMCG industry, Outstanding interpersonal skills, Generating leads, Maintaining great relations with existing clients, Brand management, Teamwork and excellent communication, Problem-solving skills"
  },
  {
    firstName: "Manmohan",
    lastName: "Singh",
    email: "Manmohanc2@gmail.com",
    phone: "9899618132",
    skills: "Sr cdp head chef"
  },
  {
    firstName: "Suvalaxmi",
    lastName: ".S",
    email: "suvalaxmisv@gmail.com",
    phone: "8971644803",
    skills: "Auto cad, Google SketchUp, Enscape, Ms office, 3dsmax"
  },
  {
    firstName: "KAUSHIK",
    lastName: "R",
    email: "kaushikhr45@gmail.com",
    phone: "9113269426",
    skills: "Space Planning & Layout Design, AutoCAD, SketchUp, 3D Visualization & Rendering, Client Communication & Concept Development"
  },
  {
    firstName: "YASH",
    lastName: "KAPOOR",
    email: "yashkapoor23532@gmail.com",
    phone: "6397100566",
    skills: "Client acquisition, closing, negotiation, relationship building, product knowledge, training solution development, curriculum expertise, communication, problem-solving, strategic thinking, CRM software"
  },
  {
    firstName: "SHUBHASH",
    lastName: "VISHWAKARMA",
    email: "shubhashvishwakarma2000@gmail.com",
    phone: "9399976459",
    skills: "CRM, HubSpot, Microsoft Excel, Microsoft Power Point, Microsoft Word, Gmail"
  },
  {
    firstName: "KARTIKEN",
    lastName: "GOEL",
    email: "kartikengoel@gmail.com",
    phone: "+918130995638",
    skills: "C++, Python, HTML/CSS, SQL, VS Code, GitHub, CRM Software, MS-Excel"
  },
  {
    firstName: "UMESH",
    lastName: "DAHIYA",
    email: "umeshdahiya09@gmail.com",
    phone: "9971738687",
    skills: "MS Office Suite, Google Workspace, CRM (Leadsquared)"
  },
  {
    firstName: "Shiva",
    lastName: "Sharma",
    email: "shivapandit99@gmail.com",
    phone: "(+91) 9625000329",
    skills: "Educational Sales, Salesforce, Lead Squared, Sales, Operations, Education Industry, Target, Admission Counselling, Education, Target Achievement, Sales Audit, Branch Management, Center Management, Area Sales Management, Team Coordination, Branch Operations, MS Office, MS Office Word, MS Office PowerPoint, MS Outlook, Advanced MS Excel"
  },
  {
    firstName: "Prateek",
    lastName: "Kamra",
    email: "prateekkamra65@gmail.com",
    phone: "8053414554",
    skills: "Analytical Skills, Ms Excel, Negotiation, Critical thinking, CRM, Data Analysis, Project Management, Sales strategy, Lead conversion"
  },
  {
    firstName: "Shreya",
    lastName: "Singh",
    email: "singh9876shreya@gmail.com",
    phone: "(+91) 6392736999",
    skills: "Microsoft Office Suit, Communication, Organizational, Adaptibility, Customer Service"
  },
  {
    firstName: "KHUSHI",
    lastName: "KUMARI",
    email: "khushikumari4269@gmail.com",
    phone: "8210475535",
    skills: "Project Management, Java, HTML, Data Structure, DBMS"
  },
  {
    firstName: "Azad",
    lastName: "Ansari",
    email: "hdfcazad@gmail.com",
    phone: "8826437623",
    skills: ""
  },
  {
    firstName: "Suruchi",
    lastName: "Sonal",
    email: "SURUCHISONAL09@GMAIL.COM",
    phone: "+91-6201901412",
    skills: "Senior carrier counsellor, advisor, overseas education, domestic education, oral communication, written communication, administrative abilities, curriculum requirements expertise, career counselling, admission counselling"
  },
  {
    firstName: "PALAVI",
    lastName: "DOGRA",
    email: "palavidogra82@gmail.com",
    phone: "7780891615",
    skills: "Project Management, Public Relations, Teamwork, Time Management, Leadership, Effective Communication, Critical Thinking"
  },
  {
    firstName: "VIVEK",
    lastName: "BAHADURIA",
    email: "viveksingh71467@gmail.com",
    phone: "+91-8745074098",
    skills: "MS Excel, CRM Tools, Sales Reporting"
  },
  {
    firstName: "Akash",
    lastName: "Kumar",
    email: "akashkrcse@gmail.com",
    phone: "6363159792",
    skills: "Inside Sales, Cold Calling, Student Counselling, Advisory, Lead Generation, Conversion, Sales Funnel, Pipeline Management, Objection Handling, Negotiation, Cross-selling, Upselling, Revenue Forecasting, Target Planning, Retention, Renewal Sales"
  },
  {
    firstName: "ROHIT",
    lastName: "SHARMA",
    email: "rohit.aligarh@rediffmail.com",
    phone: "9568332933",
    skills: "WindowsXP, Windows7, Windows8, .NET Framework, .NET, C, C++, Java, Html, Fault Debugging, installation of new hardware and software"
  },
  {
    firstName: "ABHISHEK",
    lastName: "MISHRA",
    email: "thebulletinpress@gmail.com",
    phone: "+91-9810631194",
    skills: "HubSpot CRM, Lusha, Sales Navigator, Google Ads, Meta Ads, SEO, SEM, Google Analytics, SEMrush, Ahrefs, Trello, Asana, Mailchimp, Canva, Zapier"
  },
  {
    firstName: "HEM CHANDRA",
    lastName: "JOSHI",
    email: "hem.joshi88@gmail.com",
    phone: "7291819306",
    skills: "MS Office, CRM, Relationship Management, Business Development, Sales and Operations Consultant, Negotiation Skills, Analytics, Collection Payments, P/L, Team Lead, Collection Revenue Generation, Communication, Account Management"
  },
  {
    firstName: "Ashish",
    lastName: "Nainwal",
    email: "nainwal.ashish66@gmail.com",
    phone: "+91 9910490429",
    skills: "Client communication, Relationship building, Project management, Team management, Time management, Resource management, Decision making, Leadership, Strategic planning, Analysis, Problem solving, Negotiation, Deal closing, Budget control, Cost control, Microsoft office, CRM- Leadsquared, Autocad, Sketchup, Photoshop"
  },
  {
    firstName: "ANCHLESH",
    lastName: "KUMAR",
    email: "kanchlesh@gmail.com",
    phone: "917260074312",
    skills: "Market Research and Analysis, CRM Tools LeadSquared, Sales and Negotiation, Strategic Planning, Excel, Word"
  },
  {
    firstName: "Shruti",
    lastName: "Hinger",
    email: "hingershruti@gmail.com",
    phone: "+91-9001480627",
    skills: "Business Development, Sales Strategy, Client Relationship Management, Lead Generation, Funnel Development, Market Research, Competitive Analysis, Negotiation, Communication, CRM, Data Analytics, Google Workspace, MS Office, LeadSquared, Exotel"
  },
  {
    firstName: "HITESH",
    lastName: "MEHTA",
    email: "hitesh23977@gmail.com",
    phone: "9650759511",
    skills: "Customer Service, Marketing, Sales, Team Handling"
  },
  {
    firstName: "SANDEEP",
    lastName: "JHA",
    email: "sk5045701@gmail.com",
    phone: "91 7992382899",
    skills: "Lending Products, Channel Development, Sales Management, CRM Zoho, CRM Salesforce, Compliance RBI, Compliance IRDAI, MS Excel, Portfolio Management, Loan Origination, Business Development, Channel Management, Sales Strategy, Compliance Management"
  },
  {
    firstName: "Rishipal",
    lastName: "singh.",
    email: "singhrishi84490@gmail.com",
    phone: "7500084490",
    skills: "Basic computer knowledge"
  },
  {
    firstName: "Lakshay",
    lastName: "Gupta",
    email: "gupta.lakshay@ymail.com",
    phone: "+91 8447767469",
    skills: "Leadership, Microsoft Excel"
  },
  {
    firstName: "ANNAMIKA",
    lastName: "SINGH",
    email: "annamikasingh2611@gmail.com",
    phone: "+91-83680 66921",
    skills: "Business Analysis, Data Analysis, Excel, SQL, MS Office Suite, Google Workspace, CRM platforms, Project Management"
  },
  {
    firstName: "CHHAVI",
    lastName: "TALWAR",
    email: "chhavitalwar00@gmail.com",
    phone: "+91 9310-791-281",
    skills: "Ability to quickly develop knowledge of a new market place, Natural ability to profile customers and develop relationships to maximize potential success, Excellent communicator, able to build effective relationships, Ability to build strong Customer Relationships, Highly self-motivated, with a strong work ethic and drive to reach and exceed targets, Highly motivated, organized and able to manage own time, Excellent negotiation & communication skills - including good written English, Able to acquire an effective working knowledge of journal, market and customers"
  },
  {
    firstName: "Srimukhi",
    lastName: "Tabela",
    email: "srimukhitabela@gmail.com",
    phone: "7386413443",
    skills: "Python, Power bi, C language, Sql, Excel, Communi, Adaptability"
  },
  {
    firstName: "SANJANA",
    lastName: "S R",
    email: "sanjanasramesh05@gmail.com",
    phone: "+91 9845249934",
    skills: "AutoCAD, MS Excel, REVIT Architecture & Structure models, SketchUp, Construction Drawing Review, Water Supply Systems, Documentation, Tender & Technical Report Preparation"
  },
  {
    firstName: "Shashidhar",
    lastName: "",
    email: "Goudashashi074@gmail.com",
    phone: "+91 6361023534",
    skills: "Enscape, Illustrator, AutoCAD, SketchUp, 3D tools, Ms office, Photoshop, Lumion, Canva"
  },
  {
    firstName: "Priyanka",
    lastName: "Naik",
    email: "priyankanaik46935@gmail.com",
    phone: "7204336340",
    skills: "AutoCAD, SketchUp, Enscape, Revit, V-Ray, 3ds Max, Adobe Photoshop, Microsoft Excel, Microsoft PowerPoint, Microsoft Word"
  },
  {
    firstName: "Ajay",
    lastName: "Chakravarti",
    email: "ajaychakravarti543@gmail.com",
    phone: "7899807239",
    skills: "AUTO CAD (2D & 3D), REVIT ARCHITECTURE, SKETCHUP, CABINET VISION, MS EXCEL"
  },
  {
    firstName: "Ashik",
    lastName: "Musthafa",
    email: "Ashik916a@gmail.com",
    phone: "+971562824385",
    skills: "3ds Max, Autocad, Sketchup, Lumion, Photoshop, Illustrator, Microsoft Word, Excel, Design Skills, Spatial Awareness, Computer-Aided Design (CAD), 3D Modeling and Rendering, Time Management, Budgeting, Client Communication, Collaboration, Attention to Detail, Trend Awareness, Creative Problem-Solving, Adaptability"
  },
  {
    firstName: "D. MOHAMMAD",
    lastName: "HUSSAIN",
    email: "",
    phone: "",
    skills: "Autodesk AutoCAD, Sketchup, V-Ray, Enscape, D5"
  },
  {
    firstName: "Pasula Akhila",
    lastName: "Devi",
    email: "pasulaakhiladevi025@gmail.com",
    phone: "7780337263",
    skills: "AutoCAD, Sketchup, V-Ray, Enscape, Revit, MSOffice (Excel, PPT, Word)"
  },
  {
    firstName: "Dhinesh",
    lastName: "R",
    email: "dhineshradha2000@gmail.com",
    phone: "9600659416",
    skills: ""
  },
  {
    firstName: "Anas",
    lastName: "Khan",
    email: "anaskhan99156@gmail.com",
    phone: "8010029545",
    skills: "MS Office Suite (Word, PowerPoint, Excel), AutoCAD (2D & 3D), Google Sketchup, V-Ray, 3DS MAX, Photoshop, Enscape"
  },
  {
    firstName: "Vaishali",
    lastName: "Mudholkar",
    email: "vaishalimudholkar527@gmail.com",
    phone: "9620278539",
    skills: "AutoCAD, 2D,3D Designs & Drafts, Sketch Up, STAAD Pro Vi8, RCC Design, Structural Design, Steel Design, Microsoft Excel, Microsoft World"
  },
  {
    firstName: "Senith",
    lastName: "Anil",
    email: "zenithanil2000@gmail.com",
    phone: "+91 8075489481",
    skills: "Graphic Design, Research & Development, 3D Modelling, 3D rendering, Layouting, Architecture Planning, Project Management, Material Handling, Auto CAD, 3DS max, Sketchup, Vray, Adobe Photoshop, Adobe Illustrator, Adobe Indesign, Adobe Premier pro"
  },
  {
    firstName: "RISHU",
    lastName: "RANJAN KUMAR",
    email: "rishuranjan1516@gmail.com",
    phone: "+917366972889",
    skills: "INTERIOR DESIGNING, SPACE PLANING, Technical Drawing & Drafting, 2D & 3D Rendering, Furniture & Material Selection, Color Theory, Lighting Design, Construction Documentation, Budgeting & Project Management, Basic Carpentry skills, AUTOCAD, SKETCHUP, REVIT, 3DMAX + V-RAY, ADOBE PHOTOSHOP, ENSCAPE, D5"
  },
  {
    firstName: "Deepak",
    lastName: "K",
    email: "deepak08devraj@gmail.com",
    phone: "+919392894738",
    skills: "AutoCAD, Revit, SketchUp, BIM, STAAD PRO, Structural Design, Rendering (V-RAY), 3D Modelling, Architectural detailing, Steel Structures, MS OFFICE"
  },
  {
    firstName: "SALLAVUDDIN",
    lastName: "KARJAGI",
    email: "sallavuddink@gmail.com",
    phone: "+91-9141020290",
    skills: "AutoCAD, Sketchup, V-ray, Rivet, Photoshop, Microsoft Excel, Microsoft Word, PowerPoint"
  },
  {
    firstName: "ADANAN",
    lastName: "ARSHAD",
    email: "adnanarshad3786@gmail.com",
    phone: "8660695302",
    skills: "INTERIOR DESIGNER, AUTOCAD, SKETCHUP, ENSCAPE, Photoshop, Canva, REVIT, MS EXCEL, MS WORD, MS POWER POINT"
  },
  {
    firstName: "JEEVAN",
    lastName: "D S",
    email: "jeevands060@gmail.com",
    phone: "8971727142",
    skills: "AutoCAD, Revit (arch, structures, MEP), Autodesk Navisworks, Tekla Structures, SketchUp, Lumion, Enscape, Microsoft Word, Excel, PowerPoint, Basic site coordination, drawing interpretation, construction collaboration"
  },
  {
    firstName: "ARKARAJ",
    lastName: "RUDRA",
    email: "rudraarkaraj@gmail.com",
    phone: "9332671768",
    skills: "AUTODESK MAYA, LUMION, SKETCHUP, SUBSTANCE PAINTER, POWERPOINT"
  },
  {
    firstName: "PANINDRA KUMAR",
    lastName: "YADAV N T",
    email: "panindrakumar26@gmail.com",
    phone: "9019484789",
    skills: "Quantification and rate analysis of materials, AUTOCAD, REVIT, Solid Edge"
  },
  {
    firstName: "Muttana Mahesh",
    lastName: "Babu",
    email: "muttanamahesh7@gmail.com",
    phone: "8074228403",
    skills: "AutoCAD, SketchUp, V-ray, D5 render, Coohom, Ms Office, Ms project, Space planning, layout design, Client communication, project management"
  }
];

// Helper function to process skills string
const processSkills = (skillsString) => {
  if (!skillsString || skillsString.trim() === '') return [];
  
  // Split by comma and clean up
  return skillsString
    .split(',')
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
};

// Helper function to save skills to database
const saveSkillsToDatabase = async (skills, userId, organization) => {
  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return;
  }

  try {
    for (const skillName of skills) {
      if (!skillName || typeof skillName !== 'string') continue;

      const skillNameLower = skillName.toLowerCase().trim();
      
      // Check if skill already exists for this organization
      const existingSkill = await Skill.findOne({ 
        name: skillNameLower,
        organization: organization
      });

      if (existingSkill) {
        // Increment usage count
        await Skill.findByIdAndUpdate(existingSkill._id, {
          $inc: { usageCount: 1 }
        });
        console.log(`  ✓ Updated skill: ${skillName}`);
      } else {
        // Create new skill under miscellaneous category
        const newSkill = new Skill({
          name: skillNameLower,
          category: 'miscellaneous',
          organization: organization,
          createdBy: userId,
          isCustom: true,
          usageCount: 1
        });
        await newSkill.save();
        console.log(`  ✓ Created new skill: ${skillName}`);
      }
    }
  } catch (err) {
    console.error('  ✗ Error saving skills:', err.message);
  }
};

// Main import function
const importCandidates = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get the first admin user to use as creator, or any user if no admin exists
    let adminUser = await User.findOne({ accessLevel: 2 });
    if (!adminUser) {
      adminUser = await User.findOne();
    }

    if (adminUser) {
      console.log(`Using user: ${adminUser.name} (${adminUser.email})`);
      console.log(`Organization: ${adminUser.organization}\n`);
    } else {
      console.log('⚠ No users found - skills will not be saved to the skills database');
      console.log('Candidates will still be created\n');
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const candidateData of candidatesData) {
      try {
        // Skip if no email
        if (!candidateData.email || candidateData.email.trim() === '') {
          console.log(`⊘ Skipping: ${candidateData.firstName} ${candidateData.lastName} (no email)`);
          skipCount++;
          continue;
        }

        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({ email: candidateData.email });
        if (existingCandidate) {
          console.log(`⊘ Skipping: ${candidateData.firstName} ${candidateData.lastName} (already exists)`);
          skipCount++;
          continue;
        }

        // Process skills
        const skills = processSkills(candidateData.skills);

        // Create candidate
        const candidate = new Candidate({
          name: `${candidateData.firstName} ${candidateData.lastName}`.trim(),
          email: candidateData.email,
          phone: candidateData.phone,
          skills: skills
        });

        await candidate.save();
        console.log(`✓ Created: ${candidate.name} (${candidate.email})`);

        // Save skills to database if we have a user
        if (skills.length > 0 && adminUser) {
          await saveSkillsToDatabase(skills, adminUser._id, adminUser.organization);
        }

        successCount++;
        console.log('');
      } catch (err) {
        console.error(`✗ Error creating ${candidateData.firstName} ${candidateData.lastName}:`, err.message);
        errorCount++;
        console.log('');
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`✓ Successfully created: ${successCount}`);
    console.log(`⊘ Skipped: ${skipCount}`);
    console.log(`✗ Errors: ${errorCount}`);
    console.log(`Total processed: ${candidatesData.length}`);

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Run the import
importCandidates();

