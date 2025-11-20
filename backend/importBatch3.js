const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('./models/Candidate');
const Skill = require('./models/Skill');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

// Candidate data - Batch 3
const candidatesData = [
  { firstName: "UTKARSH", lastName: "SHARMA", email: "sharmautkarsh525@gmail.com", phone: "9627255248", skills: "Excel, MS Office, Marketing, Sales" },
  { firstName: "Abhay", lastName: "Sharma", email: "abhaysharma091225@gmail.com", phone: "+91 9911701979", skills: "Strategic Sales & Business Development, Enterprise & B2B Sales, Revenue Forecasting & Pipeline Management, Negotiation & Deal Closure, Client Relationship Management, HubSpot, Salesforce CRM, Digital Marketing, SEO, Social Media Marketing, Brand Development & Positioning, Ad Campaign Development, Content Strategy, Creative Writing, Video Editing, Basic Web Development" },
  { firstName: "KUNAL", lastName: "RUSTAGI", email: "kunalrustagi1111@gmail.com", phone: "7056070296", skills: "Sales, Customer Relationship Management, Communication, Online Meetings, Objection Handling" },
  { firstName: "ASHISH", lastName: "GAUR", email: "ashishgaur1995@gmail.com", phone: "8909648655", skills: "CCCDiploma(NIELIT), Tally9.Erp., Busy3.91, English Typing" },
  { firstName: "MANOJ", lastName: "KUMAR", email: "km9868981403@gmail.com", phone: "+91 9868981403", skills: "MS-Office, Internet, various software, typing" },
  { firstName: "MANJEET", lastName: "KUMAR", email: "manjitraj221705@gmail.com", phone: "+91 7392092680", skills: "" },
  { firstName: "Devender", lastName: "Kumar", email: "devendernehra192@gmail.com", phone: "+91-9350020712", skills: "Field Sales, Client Handling, Product knowledge, Computer Diploma, Retail Sales" },
  { firstName: "ADARSH", lastName: "MISHRA", email: "adarshmishralio07@gmail.com", phone: "+91 9369451852", skills: "Sales, Merchant Acquisition, Team Leadership, Inventory Management, Warehouse Operations, Documentation & Record Keeping, Basic Computer Skills, Marketing" },
  { firstName: "SHAHZAD", lastName: "", email: "shahzad.shahzad1007@gmail.com", phone: "+91-8882020812", skills: "MS Office, CorelDraw, PageMaker, Windows XP/98/2003" },
  { firstName: "Sunny", lastName: "", email: "sunnysinghkhairpur@gmail.com", phone: "9599964792", skills: "Basic computer knowledge, Ms ward, Ms excel" },
  { firstName: "ZAHIN", lastName: "AKHTAR", email: "akhtarzahin93@gmail.com", phone: "9971733741", skills: "Lead Generation, Telemarketing, Sales Process Management, Customer Relationship, Cold Calling" },
  { firstName: "Aditya", lastName: "Tomar", email: "vishutomarvtvt@gmail.com", phone: "9557166693", skills: "MS office, internet, E-mail" },
  { firstName: "Manivel", lastName: "Kulandaivelu", email: "manivelk51@gmail.com", phone: "9741113347", skills: "Sales, Revenue Growth" },
  { firstName: "Siddharth", lastName: "Kaul", email: "sidu27@yahoo.com", phone: "09811260310", skills: "b2b saas sales expert" },
  { firstName: "Vinod", lastName: "Kaintura", email: "vkain691@gmail.com", phone: "9990171225", skills: "NA" },
  { firstName: "ABHISHEK", lastName: "CHATTOPADHYAY", email: "itsabhiz@gmail.com", phone: "+91-9890083747", skills: "Sales, Business Development, Marketing, Business Operations, Sales Strategy, Product Marketing, Channel Development, Planning, Budgeting, Management, Sales Channel Development, Institutional Sales, Corporate Sales, Government Sales, EdTech Sales, Consultative Solution Sales, Editorial Commissioning, Pre-press Process, Team Building, Brand Management, Project Handling, P&L Management, Content Management, MS Office, Google Adwords, PPC, Adobe Photoshop, Flash, Internet skills" },
  { firstName: "CHITTA RANJAN", lastName: "MISHRA", email: "cm.chitta@gmail.com", phone: "+91 9553303430", skills: "Office tools, Programming Languages, Database, Strategic Planning & Execution, Annual Operating Planning, P&L / Revenue Management, Business & Operational Excellence, Business Development & Sales Planning, Budget Planning & Forecasting, Go-To-Market Strategy, Operational Policies & Procedures, Team Building & Leadership, Process Deployment, Training & Knowledge Sharing, Client Relations, Team Leadership & Management" },
  { firstName: "BHUPENDER", lastName: "SINGH", email: "bhupisingh1275@gmail.com", phone: "9560993000", skills: "hotel management, front office management, banquet management, sales management, team management, customer service, training, scheduling" },
  { firstName: "DHARMENDRA", lastName: "", email: "dkuk1992@gmail.com", phone: "7222802236", skills: "F&B Operations, Customer Relationship Management, People Management, inventory management, IDS, WinHMS, Petpooja, POS handling, Internet, Word, Excel" },
  { firstName: "Durga", lastName: "Prasad", email: "mishrayush3861@gmail.com", phone: "8447943861", skills: "Communication, Computer, Customer Service, Management, Planning and coordination, Problem solving, Self discipline, Teamwork, Time management" },
  { firstName: "Daya", lastName: "Krishna", email: "dayakrishna_2006@yahoo.com", phone: "+91 98997 60324", skills: "Banquet Planning & Execution, Guest Service Excellence, Team Leadership & Staff Training, Menu Planning & Coordination, Communication & Client Handling, Knowledge of B2C and basic hotel systems, IDS (Hotel Management Software), POS (Point of Sale Systems), MS Word, Excel" },
  { firstName: "JAI", lastName: "KUMAR", email: "nikhilekansh8285@gmail.com", phone: "8860371314", skills: "Business solution development, negaction" },
  { firstName: "VIMAL", lastName: "TYAGI", email: "vimal.tyagi@rediffmail.com", phone: "+919873604301", skills: "Sales, Distribution, Business Development, P&L Management, Marketing, Channel Development, Trade Marketing, People Management, Quality Control, New Product Development, Budget Planning, Digital Marketing, Salesforce Automation, Competitor Profiling, Forecasting, Budgeting" },
  { firstName: "ANKIT", lastName: "TOMAR", email: "ankittomar0318@gmail.com", phone: "+91 95600-73209", skills: "Microsoft Office Suite, Salesforce, WordPress, Infusion Soft, Jira, Customer relations, Account management, Time management" },
  { firstName: "NIRNAY", lastName: "VERMA", email: "nirnayverma@gmail.com", phone: "+91-8920738108", skills: "ZOHO, Microsoft Office, Spreadsheets, LMS, CRM, Adept, Google AdWords, Google Analytics" },
  { firstName: "Anushika", lastName: "Srivastava", email: "anushika.s@myyahoo.com", phone: "9821712507", skills: "Salesforce, Hubspot, Zoho, LeadSquared, Mailchimp, Google Ads, Meta Ads, YouTube, Instagram, LinkedIn, ChatGPT, Wegic.ai, AirTable, Notion, Google Analytics, Tableau" },
  { firstName: "Venkata Hari Kumar", lastName: "Thulluru", email: "trvharikumar11@gmail.com", phone: "+917022575373", skills: "Business Development, Go-to market Strategy, New Client Acquisition, launching product in new markets, Driving the revenue growth, Handling bigger teams, Certified Lean Management Professional, Retail Store Sales and Operations, Retail SOP Knowledge and Adherence, Fashion MPM Season Execution, GP and Bottom-Line Growth, Merchandising and Stock Handling, Operations and Team Management, MS PowerPoint, MS Excel, MS Word, MS Outlook" },
  { firstName: "Puneet", lastName: "Bhardwaj", email: "bhardwajpuneet.02@gmail.com", phone: "+91-8595708752", skills: "Enterprise Sales, SaaS, Recruitment Tech, P&L Ownership, Board Reporting, GTM Strategy, Revenue Leadership, Sales Transformation, Strategic Account Acquisition, Inside Sales, Channel Partnerships, CXO Engagement, Pipeline Optimization, Demand Generation, Sales Forecasting, Quota Overachievement, Salesforce, HubSpot, Zoho, Revenue Operations, Sales Analytics, Sales Cycle Optimization, Contract Negotiation, SaaS Pricing Models, Key Account Management, Customer Retention, Market Penetration, New Business Development, Sales Team Development, Cross-functional Team Leadership, Performance Management, Coaching, Mentorship, Organizational Scaling" },
  { firstName: "Priyatham", lastName: "Chandaka", email: "priyathamch5@gmail.com", phone: "+91 8499081750", skills: "Business Development, Strategic Partnerships, Sales Strategy, Growth Strategy, CRM (HubSpot, Salesforce, ZOHO, LeadSquared), Business Planning, Client Relationship Management, Project Management, Team Leadership, Process Improvement, Marketing Strategy, Go-To-Market Strategy, Cross-functional Collaboration, Data-Driven Decision Making, International Sales, Client Retention Strategy, B2B Channel Growth, B2B/B2C Sales, AI Tools (ChatGPT, Zapier)" },
  { firstName: "Kolluri", lastName: "Viswanath", email: "kolluriviswnath70@gmail.com", phone: "09676849797", skills: "Sales, Marketing, Business Development, Sales force Excellence, Training, Marketing strategies, Brand development, Sales promotion, Team management, People development, Channel Sales Management, Distribution, Sales Training, Product training, Launching New Divisions, Man Management" },
  { firstName: "SPURTHI", lastName: "ABBURI", email: "spurttiabburi@gmail.com", phone: "9052779069", skills: "B2B Business Development, B2C Business Development, Revenue Scaling, GTM Strategy, Enterprise Sales, Consultative Sales, Strategic Partnerships, Stakeholder Management, Process Design, Team Leadership, SaaS, Executive Education Solutions" },
  { firstName: "Avinash", lastName: "Pitta", email: "avinashrajupitta@gmail.com", phone: "+91-9949340985", skills: "Hubspot, Leadsquared, Pinnacle Studio, Adobe Illustrator, Adobe Photoshop, Adobe Premiere Pro, Wondershare Filmora, Microsoft Office, HTML, CSS, C++, WordPress blogging, Domain handing, Photography, Videography, Video Editing, Music (Guitar), Blogging, Vlogging" },
  { firstName: "Vivek", lastName: "Banerjee", email: "vivekbanerjee82@gmail.com", phone: "+91-6393455701", skills: "Edtech, SAAS, CRM, Franchisee Sales & Management, E-Learning, Software Solution Sales, Content Software, Software Products, Analytical Skills, Budget Management, Communication, Identifying New Opportunities, Interpersonal Skills, Leadership, Marketing, Performance Metrics, Problem Solving, Relationship Management" },
  { firstName: "AMIT", lastName: "JAISWAL", email: "amitjai2308@gmail.com", phone: "9810681923", skills: "Agile Sales, Digital Transformation, IT Solutions, Account Management, AI/ML, Gen AI, Web 3.0, Cloud, Industry 4.0, IOT, Automation, Engineering Apps, Salesforce, AWS, SAP C/4HANA, SuccessFactors, Ariba, SAP HANA cloud, RPA, SAC, SAP Cloud platforms, SAP Hybris commerce, S/4HANA, IMS, AMS, MSP, SI, ICT, IoT, Video Analytics, Networking, Cloud Migration, Microsoft Services, Exchange, SharePoint, CRM, BI, Azure IaaS, PaaS, Cisco, Juniper, Fortinet, Palo Alto, Netapp, Hitachi, HP, Dell, Lenovo, VMware, Polycom, Avaya, Oracle, Redhat, SAP, CA, Symantec, Microfocus, BMC Software, Oracle E-Business Suite, Siebel, Peoplesoft, SOA, BI, Java, Microsoft Center of Excellence, Mobility, CRM, SaaS, Mobile Apps, RTOS, Embedded Systems, GE Fanuc, LynxOS" },
  { firstName: "Saurabh", lastName: "Mukherjee", email: "saurabh30003@gmail.com", phone: "+91 8420947233", skills: "Strategic Sales Planning, Corporate & B2B Sales, GTM Strategy, National P&L Management, Forecasting, Large Team Leadership, Campus Hiring Strategy, University-Industry Collaboration, Placement Enablement, CXO-Level Relationship Management, Key Account Growth, Channel Development, Product Development, EdTech & SaaS Strategy, Cross-functional Team Leadership, Salesforce, Slack, Nimbus, Tableau, MS Excel, Google Analytics, HubSpot, Zoho CRM, Google Workspace" },
  { firstName: "Munish", lastName: "Lodhi", email: "munishlodhi@gmail.com", phone: "+91-92167-09630", skills: "Strategic Account Ownership & Growth, Cybersecurity & Cloud Solutions, Consultative & Solution Selling, CX, CRM, CXO & Executive-Level Engagement, Upselling, Cross-Selling & Account Development, Contract Negotiations & Revenue Management, Territory Expansion & Market Penetration, Partner & Channel Ecosystem Management, Team Leadership & Mentorship" },
  { firstName: "AMIT", lastName: "PHULL", email: "amitphull@hotmail.com", phone: "+91 9811667116", skills: "Business Development, Marketing, Brand communications, Digital content, Lead Management, Financial modeling, Quantitative data analysis, Negotiations, Legal Documentation, Sale/Purchase and Lease transactions, Client Relationships, P&L management, Social Media Promotion, Investor Relations, Project Finance, Financial models, Banking relations, Strategic Initiatives, Due diligence, Fund Raising, Real Estate Transaction Advisory, Private Equity Transaction Advisory, Investment Banking, Financial planning, Sales, Equity analysis, Mutual funds distribution" },
  { firstName: "Shobhit", lastName: "Prakash", email: "shobhitprakash@ymail.com", phone: "+91 9880420695", skills: "Sales, GTM, Strategic Revenue Growth, Enterprise Sales, B2B SaaS, AI-Enabled GTM Strategy, International Sales, Leadership, AI-powered sales automation, CRM workflow design, predictive analytics, Strategic pipeline development, outbound strategy, opportunity management, Strategic partnerships, ecosystem alliances, channel strategy, Sales analytics, conversion reporting, funnel metrics, intent-based orchestration, Salesforce, HubSpot, marketing automation, account-based marketing, ABM, RFP/RFI processes, consultative account management" },
  { firstName: "Vishal Kumar", lastName: "Tandon", email: "vish_tandon@yahoo.co.in", phone: "(+91) 9899397500", skills: "Service Delivery Management, Business Transformation, Business Excellence, Operational Planning, Workforce Management, Account Management, Stakeholder Management, Profitability Management, Contact Center Operations, Channel Management, Business Development, MS Office Suite (Excel, PowerPoint, Word), Call Center Management Tools, Data Analytics and Visualization, Quality Monitoring Applications, Experience on advance AI tools" },
  { firstName: "Sumit", lastName: "Bali", email: "sumitbali1979@gmail.com", phone: "+91- 9915715737", skills: "Sales, Marketing, Business Development, Operations Management, Team Management, Strategic Sales Planning, Budgeting, P&L, Revenue Growth, Market Penetration, Competitive Analysis, Market Trend Analysis, Business Expansion, Customer Management, Stakeholder Management, Team Building, Training, Coaching, Business Consulting, Learning & Development" },
  { firstName: "Syed Zohair", lastName: "Abbas", email: "s_zabbas@yahoo.co.in", phone: "+91 9885204567", skills: "Microsoft Office, CRM, Sales Force.com, P&L preparation, Business Development, Client Networking, Bid Submission, Costing, Procurement Coordination, RFP, Tender Participation, Channel Partner Management, Consultative Selling, Contract Management" },
  { firstName: "Abhijit", lastName: "", email: "Chefabby02@gmail.com", phone: "9654508880", skills: "Multi-Outlet Culinary Operations, Menu Engineering & Recipe Standardization, Kitchen Team Leadership & Training, Food Quality & Hygiene Compliance, Inventory, P&L Understanding & Cost Control, Vendor Coordination & Supply Chain Oversight, P&L Accountability & Budgeting, New Outlet Setup & Pre-Opening Operations" },
  { firstName: "GURUDEEP", lastName: "SINGH AZAD", email: "gurdeepsinghazad@gmail.com", phone: "09999967804", skills: "HACCP, Food cost control, Menu planning, Culinary knowledge, Knife Skills, Improvisation, Speed and Accuracy, Product Knowledge" },
  { firstName: "SUSHIL", lastName: "SHARMA", email: "heelsush@gmail.com", phone: "9699989797", skills: "Windows Server, Azure Server, VM, Aws Server, Sql, PLSQL, MYSQL, SQL Server 2008, SQL Server 2012, SQL Server 2014, SQL Server 2016, SQL Server 2017, SQL Server 2019, SQL Server 2022, Internet Information Services, Windows, Android, Thermal Printers" },
  { firstName: "MANGAL", lastName: "SINGH CHAUHAN", email: "mangalsinghchauhan985@gmail.com", phone: "9911860659", skills: "Indian Curry, Tandoor, Executive Sous Chef, Executive Chef, Head Chef, Commi 1, CDP" },
  { firstName: "ANIL KUMAR", lastName: "CHAUHAN", email: "rockanil091  @gmail.com", phone: "+ 918744921287", skills: "Kitchen administration, Ordering food, High value catering, Fine dining, Advanced food hygiene, Seasonal dishes, Food cost control, Supervising, La carte menu, Fresh food, Food tasting, Equipment maintenance" },
  { firstName: "RAVINDER", lastName: "KUMAR", email: "ravinderks83@yahoo.co.in", phone: "+91-9582128095", skills: "Research & Development (R&D) in Indian Cuisine and Frozen Products, Recipe Development and Food Innovation, Shelf-Life Standardization and Food Quality Control, Market Trend Analysis, Inventory Management (FIFO System), Hygiene & Food Safety Policy Implementation, Training & Development of Culinary Teams" },
  { firstName: "Amit", lastName: "Kumar", email: "Upadhyay.amit1993@gmail.com", phone: "+91 9610261231", skills: "Windows (XP, NT, 0SX, 2000 and Latest Version of Window.), Microsoft Word, Microsoft Excel, PowerPoint" },
  { firstName: "Raman", lastName: "lal", email: "ramanlal67@gmail.com", phone: "9873528301", skills: "Microsoft Office, Power Point, Excel, Word, Net Surfing, File Transferring, Downloading, Mail Composing, File Attachments, cost control, recipes standardization, inventory control, food quality control, training programs, R&D, new outlet opening" },
  { firstName: "PUSHKAR", lastName: "SINGH", email: "pappurathour1730@gmail.com", phone: "+919594263013", skills: "Cooking, Cost controls, Management, Crew training, Development, Budgeting, HACCP, Food Safety, Food Costing, Cost Control, Food Quality" },
  { firstName: "GANESH", lastName: "THAPLIYAL", email: "thapliyal.ganesh9@gmail.com", phone: "9871755737", skills: "Vendor Relations, Staff Coordination, Menu development, Business Management, Regulatory Compliance, Resource Management, Purchasing, Cost Control, Food and beverage pairing, Workflow Optimization, Dish preparation, Sanitation Guidelines, Food preparation techniques, Performance Assessments, New Hire Training, Forecasting and planning, Budgeting and cost control, Company safety standards, Performance Improvement" },
  { firstName: "Jaydip", lastName: "Mane", email: "jaydip.22210154@viit.ac.in", phone: "9322552354", skills: "python, SQL" },
  { firstName: "ISHITA", lastName: "RATHOD", email: "ishitarathod29 @gmail.com", phone: "9265216340", skills: "Lead Generation, Client Acquisition, BOM Analysis, Quotation Preparation, Procurement, Vendor Coordination, Customer Relationship Management (CRM), Technical Communication, Commercial Communication, MS Excel, ERP Tools, Data Entry" },
  { firstName: "Ajay", lastName: "Raval", email: "ravalajay67108@gmail.com", phone: "9978946164", skills: "PLC Programming, SCADA, Wonderland, Intouch, Industrial Measurement, Leadership" },
  { firstName: "Dhruvi", lastName: "Vyas", email: "dhruvi.v2213@gmail.co", phone: "9016062867", skills: "CAM350, Proteus, Arduino, MATLAB, CRM" },
  { firstName: "ASHOK", lastName: "CHAUHAN", email: "ashok.chauhan2205@gmail.com", phone: "+91 8238336083", skills: "MS office, CRM, GEM/ Tender, Presentation / Demonstration, Solution / Services Sale, Market Expansion, Client Relationship Management, Lead Generation, Contract Negotiation" },
  { firstName: "MAHESH", lastName: "SINGH", email: "mahesh28.1994@gmail.com", phone: "9619936221", skills: "Salesforce CRM, MS Excel, MS PowerPoint, WMS, Asset Tracking, RFID Middleware, QR/Barcode Solutions, ERP Integration, PoC/Pilot Setup, SaaS Demos, Barcode Printers, HHTs/Scanners, RFID Readers/Tags, Label Printing Solutions, B2B Sales, Solution Selling, Strategic Accounts, Pre-sales, Lead Gen, Forecasting, CXO Engagement, Negotiation & Closure" },
  { firstName: "Debapratim", lastName: "Das", email: "debapratim4@gmail.com", phone: "+91-8879523114", skills: "MS Windows, Ubuntu Linux, Ms Excel, Word, MS Powerpoint, C programming, C++, Java, Java script, SPSS, Wordpress, Canva Design, UGS NX6, Solidworks, Ansys" },
  { firstName: "Thogiti", lastName: "Venkateswarlu", email: "togitivenky263@gmail.com", phone: "+91 96031 09278", skills: "AutoCAD, CAD+T, SketchUp, Photoshop, Furniture design, Project management, Material Requirement Planning" },
  { firstName: "Muhammed", lastName: "Shijas", email: "inzamam.ok@gmail.com", phone: "6282366676", skills: "3D Modeling, 3D Visualizing, Sketchup Modeling, D5 Rendering, Lumion Rendering, AutoCad Droughting, Concept Designing, Interior Designing, Drafting Furniture and Plan Layout" },
  { firstName: "FATHIMA", lastName: "RIHANA", email: "allahabthy92@gmail.com", phone: "8754887991", skills: "Design interior space planning, Sketchs drawing, floor plans, computer aided Design programs, hand drawing skills, Assembling moduler kitchen, wardrobe, electrical layouts, plumbing layouts, detailing layouts, 3 modelling, 2d draft management, 3d projection by cad, selection and control of mixed light sources, 3dmax, Freehand sketch, market surveying, furniture designing, rendering, stitching fabrics, interior decoration, communication skills, data analysis, space planning, modular kitchen designs, knowledge of building code, knowledge of FAR, FSI, structural load calculation" },
  { firstName: "Akansha", lastName: "Anand", email: "akanshaanand691@gmail.com", phone: "7988784322", skills: "Communication Skills, Recruitment Management, MS Office, Fund Management, Finance, Marketing, Sales, HR, Financial Analysis" },
  { firstName: "SACHIN", lastName: "GUPTA", email: "guptasachinkumar78@gmail.com", phone: "+917224968380", skills: "B2B Sales, Communication, Problem Solving, Excel, Customer Support, Customer Handling, Team Work" },
  { firstName: "Love", lastName: "Dhingra", email: "lovedhingra02@gmail.com", phone: "(+91) 9540756571", skills: "Salesforce CRM, Sales, Cold Calling, Domestic BPO, Outbound Calling, Back Office" },
  { firstName: "ANNPOORNA", lastName: "DWIVEDI", email: "annpoornadwivedi143@gmail.com", phone: "+91-8318214584", skills: "Anti-money laundering, Transaction monitoring, Customer Due Diligence, Enhanced Due Diligence, Financial crime prevention, Escalation handling, High Risk Account Review, Data Collection and Analyzing, AML ALERT, Sanction Screening, Global Operations, AML compliance" },
  { firstName: "Ravi", lastName: "Bisht", email: "", phone: "+919319846882", skills: "" },
  { firstName: "Tarun", lastName: "Kumar", email: "tkjoshi18@gmail.com", phone: "9811270176", skills: "MS Office" },
  { firstName: "KULDEEP", lastName: "SHARMA", email: "kuldeep.optimist786@gmail.com", phone: "+91- 9315877363", skills: "Gardemanger, Continental, Oriental Cuisine, Tandoor Section, Computer Application" },
  { firstName: "Narender", lastName: "Negi", email: "neginarender68@gmail.com", phone: "91-9999046279", skills: "" },
  { firstName: "Kunal", lastName: "More", email: "kunalmore1212@gmail.com", phone: "+91-9769320982", skills: "FMEA, SPC, Kaizen, poka yoke, Unigraphics, Minitab, Google suites, MS office" }
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


