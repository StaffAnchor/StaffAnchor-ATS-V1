const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('./models/Candidate');
const Skill = require('./models/Skill');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

const candidatesData = [
  { firstName: "RACHEL", lastName: "VERONICA", email: "rachel.veronica1027@gmail.com", phone: "+91 89048 07711", skills: "AutoCAD, 3ds Max, SketchUp, V-Ray, Enscape, Lumion, Photoshop, InDesign, Lightroom, Microsoft Office Suite, Space Planning, High-quality 3D Rendering and Visualization, FF&E Selection, Vendor management, site supervision" },
  { firstName: "R. Sowmya", lastName: "", email: "sowmyaprathap5828@gmail.com", phone: "6281052313", skills: "AutoCAD, Sketchup, Revit, 3 Dx max, Lumion" },
  { firstName: "PRAJWAL", lastName: "S", email: "Tejprajwal013@gmail.com", phone: "+91 8050665753", skills: "AutoCAD, Sketchup, vray" },
  { firstName: "PAVANI", lastName: "", email: "pavaniballary@gmail.com", phone: "7676312795", skills: "MS Office Excel, MS Office Word, MS Office PowerPoint, P6 Primavera, Staad pro, Auto CAD, REVIT, Google Sketch up" },
  { firstName: "NAVNISH", lastName: "PAL", email: "navnishofficial@gmail.com", phone: "+91 8748020415", skills: "AutoCAD, MS Excel, Staad Pro, Slump Test" },
  { firstName: "NAVEEN", lastName: "S", email: "Naveensaravana4@gmail.com", phone: "8296304005", skills: "Microsoft office, Digital Architect and Interior Design, MS-OFFICE" },
  { firstName: "Nanddakumar", lastName: "", email: "nandakumar2003nandu@gmail.com", phone: "9567598705", skills: "SketchUp, Autocad, Creative thinking, Digital drawing, Painting, Designing" },
  { firstName: "LAKSHATH", lastName: "US", email: "lakshath888@gmail.com", phone: "7483069438", skills: "HTML, CSS, Typography, Color Theory, Wireframing, Prototyping, Design Systems, Figma, Responsive Design" },
  { firstName: "Arvind", lastName: "Arya", email: "02arvind09@gmail.com", phone: "9899992154", skills: "Hospitality Management, Events Planning & Mgmt., Marketing Strategy & Roadmap, F&B Operations, Cross-functional Coordination, Business Development, Customer Complaints Resolution, Health & Safety Compliance, Cost Control Management, Client Relationship Management, New Business Development, Stock Management, Time & Waste Management, Facility Management, People Management, MS Word, MS Excel, MS PowerPoint, Internet Applications" },
  { firstName: "ANUSHA", lastName: "KULKARNI", email: "anushakulkarni41@gmail.com", phone: "+91 7892958798", skills: "AutoCad, SketchUp, Revit, Twinmotion, Lumion, V-Ray, Microsoft Office, Photoshop, Illustrator" },
  { firstName: "JAYANTH", lastName: "MR", email: "jayanthmr23@gmail.com", phone: "9164181321", skills: "AutoCAD, Google SketchUp, V-Ray, Enscape, Photoshop, Microsoft Excel" },
  { firstName: "RAJESHWARI", lastName: "S", email: "Rajeshwariprasad6363@gmail.com", phone: "6366063648", skills: "AutoCAD 2D/3D, Revit Architecture, Power Point, Design Consulting, Wings, Technical Reports, Interior Designing" },
  { firstName: "Bishakha", lastName: "Phukan", email: "bishakhaphukan4@gmail.com", phone: "9859916742", skills: "AutoCAD, SketchUp, Enscape, Autodesk Revit" },
  { firstName: "KEERTHI", lastName: "G R", email: "keerthigr89@gmail.com", phone: "+91 7090149192", skills: "Interior Design, 2D Architecture, 3D Architecture, Drafting, Google Sketch-up, V-ray, Site supervisor, AutoCAD" },
  { firstName: "Om", lastName: "Palikondwar", email: "palikondwarom11@gmail.com", phone: "+91–9966196522", skills: "Sales, Business Development, Client Communication, Problem Solving, Team Management, Negotiation, Cold Calling, People Management, IT Sales, CRM (Zoho, Salesforce), Market Research, Branding, Secondary Research, Lead Generation, Pipeline Management, Customer Service, Revenue Generation" },
  { firstName: "muralidhar", lastName: "gangula", email: "muralidhargangula94@gmail.com", phone: "(+91) 8885833000", skills: "B2B Sales, Team Handling, Key Account Management, Area Sales Management, Business Development Management, Sales and Marketing, Relationship Management, Corporate Sales, SaaS, IT Sales, Inbound Calls, Outbound Calling" },
  { firstName: "NEERAJ", lastName: "KORADA", email: "neeraj.korada94@gmail.com", phone: "7386504159", skills: "Google Ads Manager, Google Analytics, HubSpot, Salesforce, Adobe Creative Cloud, Microsoft Excel, Word, PowerPoint, Campaign Strategy, Customer Relationship Management, Data Analysis, Cross-Selling, Negotiation, Social Media Marketing" },
  { firstName: "B.Tharun", lastName: "", email: "tharunb773@gmail.com", phone: "+919392587550", skills: "Salesforce, Zoho CRM, Inside Sales, Software Sales, Digital Sales, Team Leadership, SaaS, Ed Tech, B2B, B2C" },
  { firstName: "SIDDHI", lastName: "THAKKAR", email: "siddhi.thakkar95@gmail.com", phone: "+91 91379 41520", skills: "Consultative Selling, Client Management, Performance Marketing, CRM Tools, Team Leadership" },
  { firstName: "NEHA", lastName: "", email: "raoneha407@gmail.com", phone: "7082721145", skills: "Inventory Management, HR Policy Implementation & Compliance, Onboarding & Induction Processes, Leadership & Strategic HR Planning, Training & Development Programs, Recruitment & Talent Acquisition" },
  { firstName: "DEVIKA", lastName: "SONAR", email: "devikasonar5680@gmail.com", phone: "9421059503", skills: "Recruitment, onboarding, MS Word, Google Workspace, communication skills, Communication, Leadership and Team Work, Time Management, Flexibility and Adaptability, Organizational skills, Employee Data Management, Interview Coordination, End-to-End Recruitment, Onboarding & Induction" },
  { firstName: "ROUSHAN", lastName: "SINGH", email: "roushankrsingh499@gmail.com", phone: "+91 9939062741", skills: "Event & Project Management, Team Leadership & Support, MS Office (PPT, Excel, Word)" },
  { firstName: "Muskan", lastName: "Bhardwaj", email: "muskan.career2003@gmail.com", phone: "+91-9205937506", skills: "Tally ERP, MS Excel, MS Word, Compliance, Loan Documentation, Auditing Support, Digital Marketing Basics, MS PowerPoint, Market Research" },
  { firstName: "AVANTIKA", lastName: "UPADHYAY", email: "avantikaupadhyay33@gmail.com", phone: "+91-7355469419", skills: "Human Resource Management, Recruitment, Onboarding, Employee Engagement, Performance & Learning Development, Employer Branding, HR Analytics, Recruitment & Selection, Digital Marketing, Social Media Marketing, Market Research, Consumer Behavior, MS Office Suite, Excel, Word, PowerPoint, Data Analysis, Strategic Thinking, Problem-Solving" },
  { firstName: "AAKASH", lastName: "SHUKLA", email: "", phone: "", skills: "Virtual Desktop Infrastructure (VDI), IT support operations, automation, solar power plant installation, commissioning, regulatory compliance, feasibility studies, maintenance protocols, learning and development evaluation, survey design, data analysis, HR operations, workforce policies, employee management system, candidate screening, interview coordination" },
  { firstName: "VIDHI", lastName: "DUDEJA", email: "dudejavidhi6@gmail.com", phone: "9210928003", skills: "Adobe photoshop, Adobe illustrator, Coral Draw, Adobe Indesign" },
  { firstName: "Shatakshi", lastName: "Singh", email: "shatakshisingh3062003@gmail.com", phone: "9263228827", skills: "CRM, employee relations, Market Research and analysis, Recruitment & Selection, Sourcing, Screening, Interviewing, Employee Relations, Conflict Resolution, Employee Engagement, HR Analytics, Data Analysis, Reporting, MS Office (Word, Excel, PowerPoint), Communication, Teamwork, Empathy, Negotiation" },
  { firstName: "Sweety", lastName: "Chauhan", email: "chauhansweety79@gmail.com", phone: "8954696397", skills: "Excel, MS office, Word, Google sheet, Recruiting, Screening, Telephonic Interviews, Onboarding" },
  { firstName: "Shivam", lastName: "Kumar", email: "shinghs070@gmail.com", phone: "+91 8737999063", skills: "Business Development, Lead Generation, B2B Sales, Business-to-Consumer Sales, Sales Operations, Client Acquisition, Sales Process, Strategic Marketing, Innovation, Salesforce, HubSpot, Lemlist, LinkedIn, Claude, CRM Software, Databases, Data Management, SEO Optimization, Web Analytics, Keyword Research, Content Marketing, Go-to-Market Strategy, Global Marketing, Technical Recruiting, Talent Acquisition, Full-Life Cycle Hiring, Process Optimization, Team Coordination, Risk Analysis, Vendor Management, Microsoft PowerPoint, Social Media Management, CareerBuilder" },
  { firstName: "SHARMILA", lastName: "DEVI", email: "Sharmikrish30@gmail.com", phone: "9 8883028901", skills: "ATS, Boolean search Techniques, HRIS & HRMS Tools, Video conferencing & Interview Tools, Email & Communication Tools, Sourcing platforms & Job portals, MS office Tools" },
  { firstName: "RIYA", lastName: "", email: "riya07062003@gmail.com", phone: "8603402799", skills: "MS- EXCEL, MS-POWER POINT, MS-WORD, LinkedIn Sales Navigator, InMail" },
  { firstName: "SHRIYA", lastName: "", email: "Shriyasharma274@gmail.com", phone: "9997386035", skills: "Canva, MS Office, MS Excel, Google Workspace, Microsoft Team, Zoom, Google Meet, Power BI, Tableau" },
  { firstName: "CHAITRALI", lastName: "PARAB", email: "anganechaitrali@gmail.com", phone: "835 606-1420", skills: "Talent Acquisition, Employee Onboarding, Recruitment, Screening, Interviewing, Employee Engagement, Customer Service" },
  { firstName: "MAHIMA", lastName: "SATPUTE", email: "mahimasatpute62@gmail.com", phone: "9579656851", skills: "Candidate Sourcing, Job Posting, Canva, Microsoft office" },
  { firstName: "Prajakta", lastName: "Jamdade", email: "prajakta.jamdade.23@gmail.com", phone: "+91 9588414370", skills: "Basic Recruitment, Interview Scheduling, Resume Screening, Onboarding, Documentation, Understanding of HR Functions, HR Policies, MS Office (Excel, Word, PowerPoint), Time Management, Team Collaboration" },
  { firstName: "Poorvi", lastName: "Sharma", email: "poorvisharma343@gmail.com", phone: "+91 7247000886", skills: "" },
  { firstName: "PANKAJ", lastName: "DAS", email: "pankajkdas.mail@gmail.com", phone: "(+91) 8486648417", skills: "Recruitment Lifecycle Support, Candidate Sourcing & Screening, Client & Candidate Communication, CRM & Web-based Tools, Remote Operations & Coordination, Data Handling & Documentation" },
  { firstName: "Manish", lastName: "Goswami", email: "manishpandit5899@gmail.com", phone: "+91 9917072430", skills: "Recruitment & Onboarding, Payroll Processing, HR Statutory Compliance Management, Labor Laws, Compensation & Benefits, Employee Engagement, Grievance Handling, Performance Management, HRBP Practices, HR Policies, HR Analytics, SAP, Zimyo HRMS, MS Office" },
  { firstName: "Rohitha", lastName: "Krishna", email: "bs.krishna2026@sibmnagpur.edu.in", phone: "9148397151", skills: "SOP development, cost optimization, D2C benchmarking, supply chain operations, process improvement, waste reduction, data cleaning, data analysis, data visualization, Excel, SQL, R, Tableau, root cause analysis, process mapping, quality control" },
  { firstName: "ANISHA", lastName: "MUKHERJEE", email: "mukherjeeanisha534@gmail.com", phone: "+919907558528", skills: "Google Workspace, MS Office, Slack, Managing WhatsApp Groups, Chat GPT, HRIS, MIS, HR Software Proficiency, Applicant Tracking Systems (ATS), Payroll and Payslips, Documentations, Benefits Administration, CRM" },
  { firstName: "Divya", lastName: "", email: "divya.perambudur@gmail.com", phone: "7022146750", skills: "AI Tools, Ceipal, ChatGPT, Client Handling, Contract Staffing, Datapower, Employee Engagement, End- to- End Recruitment, Human Resource Management, Invoices, IT Recruiter, Job Portals, LinkedIn, Microsoft Excel, Microsoft Office, Microsoft Word, Monster, Naukri, Negotiating Salaries, Payroll Management, Permanent Staffing, Screening, Social Media, Sourcing" },
  { firstName: "SHIKHA", lastName: "YADAV", email: "shikhayadavtbt09@gmail.com", phone: "9219151405", skills: "CO MMUNICATION, FLEXIBILITY, CONVENCING SKILL" },
  { firstName: "BHUVANESHWARI", lastName: "N", email: "Buvana5124@gmail.com", phone: "7760845948", skills: "MS EXCEL, MS WORD, MS POWERPOINT, Advanced Excel" },
  { firstName: "MONIKA", lastName: "BHARTI", email: "monikakumari36@gmail.com", phone: "07256891525", skills: "Data-Driven HR Decision Making, Excel, Recruitment Coordination, Time Management, Data Analysis, Applicant Tracking Systems, Office Administration, Process Automation" },
  { firstName: "K.B.", lastName: "HARITHA", email: "iharithakb@gmail.com", phone: "+91 – 9100883074", skills: "C#.Net 2010, C#.Net 2013, C#.Net Online, OBIEE, OSB, SOA, Wblogic Admin, CC&B, Hyperion Essbase, FDMEE, ODI, FCCS, HFM, FSCM, Jenkins, Docker, DevOps, AWS Admin, GitHub, Splunk, Kubernetes, AWS Platform Support Engineer, AWS RunBook Automation Engineer, Azure Platform Support Engineer, DevOps (CI/CD), IBM Cloud Platform Support Engineer, System Admin, AWS cloud Fullstack, Azure cloud Fullstack, AWS Cloud Microservices, JAVA Fullstack developer, SAP ABAP, SAP MM, SAP SD, SAP FI, SAP CO, SAP BPC, SAP PLM, SAP PP, SAP QM, SAP SRM, SAP XI PI, ADP Tool, SCM, SAP PPDS, SAP APO, SAP Ariba, SAP HR, SAP APO SNP, SAP APO DP, SAP CIN (SD,MM,FI), SAP AFS (MM, PP), SAP HANA, SAP BI BW, CPI, HANA" },
  { firstName: "Aliya", lastName: "Sheikh", email: "aliyasheikh2208@gmail.com", phone: "8439179357", skills: "Microsoft Office, Internshala, LinkedIn Recruiter, Talent Acquisition, Indeed, Microsoft Excel, Microsoft Outlook, Job Description Development" },
  { firstName: "Antara", lastName: "Dekate", email: "antaradekate@gmail.com", phone: "+91-7666753303", skills: "Microsoft Office, Excel, PowerPoint, Tally, HTML, CSS, JavaScript, Windows XP, 7, 8, 10, 11" },
  { firstName: "PRIYA", lastName: "NEGI", email: "prianegiii@gmail.com", phone: "9211207542", skills: "Writing, Editing, Article writing, proofreading, content structuring, Leadership, Team guidance, task delegation, communication, MS Word, Google Docs" },
  { firstName: "Astha", lastName: "Agarwal", email: "asthaaug2001@gmail.com", phone: "(+91) 9897201464", skills: "Leadership Skills, Team Management, Account Management, MS Office, Excel, Negotiation, Persuasion, Primary Research, Secondary Research, Lead Generation, Relationship Management, HRMS Tools, Zoho, SAP, Conflict Resolution, Grievance Handling, Communication, Interpersonal Skills, Google Workspace, Docs, Sheets, Drive, Talent Acquisition, Recruitment, Interview Scheduling, Coordination, Job Portals, Naukri.com, LinkedIn, Shine, Policy Implementation, Adherence" },
  { firstName: "Shreya", lastName: "Dasgupta", email: "shreyadasgupta922@gmail.com", phone: "+91 9123031298", skills: "Talent Acquisition, End-to-End Recruitment, Job Posting, Applicant Screening, Interview Scheduling, Candidate Engagement, LinkedIn Sourcing, Job Portals, Resume Optimization, Client Handling, Team Collaboration, Communication, Market Research, Talent Mapping, Event Coordination, Campaign Coordination" },
  { firstName: "SUPRIYA", lastName: "GT", email: "supriyass1654@gmail.com", phone: "7760058159", skills: "COMPUTER BASICS, TALLY WITH GST, MS Excel, Shortcuts, Combining data, Splitting data, Converting formulas to text, ULOOKUP, Pivot tables, AI AND Automation tool usage, resume screening and candidate matching, enhancing candidate experience, ethical AI and Bias reduction, AI-based interviewing techniques" },
  { firstName: "Vamshi", lastName: "Balabathula", email: "vamshibalabathula74@gmail.com", phone: "6300404753", skills: "MS Office (Excel, Word, PowerPoint), Canva, Adobe Express, Basic HRMS tools" },
  { firstName: "DIVYA", lastName: "RANI", email: "drani9644@gmail.com", phone: "9461402195", skills: "" },
  { firstName: "Sanskriti", lastName: "", email: "sanskritisaumya2002@gmail.com", phone: "+917870635235", skills: "Microsoft Suite, Advanced Excel for Business" },
  { firstName: "SNEHA", lastName: "DUTTA", email: "snehadutta25005@gmail.com", phone: "+91 7063510692", skills: "Time Management, Communication, Team Collaboration, Critical Thinking, Management Basics, Emotional Intelligence, CRM Understanding" },
  { firstName: "Anshita", lastName: "Vij", email: "anshitavij08@gmail.com", phone: "+917505069867", skills: "MS Office, Power BI, human resource functions" },
  { firstName: "Sukriti", lastName: "Kharyal", email: "sukritikharyal@gmail.com", phone: "7889380023", skills: "Microsoft office" },
  { firstName: "JIGYASA", lastName: "GOYAL", email: "jigyasagoyal18@gmail.com", phone: "9717385006", skills: "MS Office, Excel, MS Word, MS PowerPoint, Data collection, literature review" },
  { firstName: "Kavitha", lastName: "R", email: "rkavi13618@gmail.com", phone: "+918610597944", skills: "SQL, Microsoft word, Microsoft Excel, Knowledge of google suite, Microsoft Powerpoint" },
  { firstName: "Harshpreet", lastName: "Bagga", email: "yukti26kaur@gmail.com", phone: "6397182041", skills: "Screening, Onboarding, Time Management, MS Excel, Candidate Sourcing, Recruitment, Teaching, Boolean Search" },
  { firstName: "Ravali", lastName: "Sirimella", email: "rsirimella04@gmail.com", phone: "6300407361", skills: "Applicant Tracking Systems, Recruitment, Active & Passive Sourcing, Contract Negotiation, Microsoft Office, Benefits and compensation" },
  { firstName: "Gurpreet", lastName: "Singh", email: "Gurpreet.panesar1995@gmail.com", phone: "7007551600", skills: "Full Cycle Recruiting, Recruitment and Retention Strategies, Candidate Sourcing, Onboarding, Offer Negotiations, LinkedIn Recruiter, Team Building, Boolean Searches, Business Reporting, Talent Acquisition, Sourcing/Interviewing, Human Resources Generalist/Coordinator, Benefits and Compensation, Pre-Employment Screening, Client relationship management, Business Development, Project Management, Team Collaboration, Head Hunting, Talent Sourcing, Recruitment Management, Talent Hire, Talent Engagement, Interview Coordination, International Recruitment, Recruitment Consulting, Talent Management, MS Word, MS Excel, Outlook" },
  { firstName: "RASHI", lastName: "JAIN", email: "rashijaingarg2000@gmail.com", phone: "+91 9891842745", skills: "Payroll Processing, Employee Relations, Recruitment & Onboarding, HR Operations, Training Coordination, HRMS (GreytHR, Keka, Zoho People), ATS Tools (Naukri RMS, LinkedIn Recruiter), MS Excel (VLOOKUP, Pivot Tables), Google Workspace" },
  { firstName: "ASWATHY", lastName: "JYOTHISH", email: "achujyothish@gmail.com", phone: "7034704131", skills: "IT Recruitment, Technical Hiring, Talent Acquisition, Stakeholder Management, Client Relationship Management, Candidate Sourcing, Recruitment Metrics, Data Analysis, Offer Negotiation, Documentation, Interview Process Facilitation, Team Leadership, MS Excel, PowerPoint, Word" },
  { firstName: "Ankit", lastName: "Barma", email: "barmaankit353@gmail.com", phone: "7992941904", skills: "Human resources, Communication, Project management, Hr consulting, Analytics, Tally Erp, Leadership, Microsoft excel, Finance, Microsoft word, Financial analyst, Business analyst" },
  { firstName: "MANASA", lastName: "J", email: "manasajillelamudi333@gmail.com", phone: "+91 7075953639", skills: "SAP all Modules, Python, HR Shared Services, Full stack developer, Big data, Machine Learning, Data Science, Informatica, ServiceNow, Testing, Data Analytics BI, C2H Hiring, IT Recruitment, Screening, Salary Negotiation, LinkedIn Recruitment" },
  { firstName: "ANSHU", lastName: "SINGH", email: "anshusingh84231@gmail.c", phone: "(+91) 9795417742", skills: "MS Office, Word" },
  { firstName: "Ashu", lastName: "Pareek", email: "pareekashu18@gmail.com", phone: "9728240565", skills: "Non-IT & IT Recruitment, End-to-End Hiring, Job Posting (Naukri, LinkedIn, Apna), Interview Scheduling, Walk-in Coordination, Onboarding & Documentation, Candidate Engagement, Ms office & Google Sheets, HRMS Tools" },
  { firstName: "Tanvi", lastName: "Parakh", email: "Tanviparakh09@gmail.com", phone: "+91 7559173722", skills: "Time management, Effective Pitching, Customer Relation, Leadership, Prompt decision, MS PowerPoint" },
  { firstName: "ARCHANA", lastName: "KUSHWAHA", email: "archanakushwaha796@gmail.com", phone: "+917518054696", skills: "End-to-end Recruitment, Preliminary Interviewing skills, In-depth understanding of labour laws and regulations, Proficiency in MS Office (Word, Excel and PowerPoint)" },
  { firstName: "Nikita", lastName: "", email: "nikitadhasmana174@gmail.com", phone: "±918194056224", skills: "Emotional Intelligence, Research, detail-oriented, Strong organisational skills, Effective communication, interpersonal skills, Time management, attention to detail" },
  { firstName: "Gurpreet", lastName: "Singh", email: "gurpreetsinghhh016@gmail.com", phone: "6372518226", skills: "excel, Recruitment, Screening resumes" },
  { firstName: "ARUN", lastName: "CHAUDHARY", email: "arunchaudhary0803@gmail.com", phone: "+91 8630542341", skills: "Recruitment, Employee Relations, Performance Management, Training and Development, Data Analysis, Resume Screening, Candidate Assessment, Applicant Tracking System" },
  { firstName: "A.Yashwitha", lastName: "", email: "Yashwitha.amidala@gmail.com", phone: "8074058348", skills: "Tally ERP9, MsExcel, DBMS, HR Payroll, Generative AI InHR" },
  { firstName: "Ram Krishna", lastName: "Pandita", email: "panditramakrushna@gmail.com", phone: "7735970821", skills: "MS Office, Excel, Power Point, Word, Power BI, Google Sheet, ChatGPT, Meta AI, Canva, DeepSeek, Photo Shop, Financial planning, Business statistics, Recruitment, Workforce Planning, Stakeholder Communication, Analytical Thinking, Decision Making with Data, Team Coordination, Data Visualization, Communication, Leadership, Team Management, Relationship Building, journal entries, final accounts, GST/TDS compliance, MIS reporting, cash flow, investment analysis, cost control, Offboarding Processes, Employee Engagement" },
  { firstName: "Priyal", lastName: "Jain", email: "jainpriyal450@gmail.com", phone: "9696249758", skills: "Excel, Word, Powerpoint" },
  { firstName: "Rakhi", lastName: "Kumari", email: "rakhipurve@gmail.com", phone: "91428 09330", skills: "Microsoft Office Suite, Tally Prime, Team Management, Time Management, Problem Solving, Leadership, Financial Market Analysis, Power BI, Data Skills" },
  { firstName: "MEGHA", lastName: "SINGH", email: "meghasingh1458@gmail.com", phone: "+91-6206511924", skills: "Human Resources(HR), Marketing And Sales, Operations Management, Strategic Planning, Leadership Dynamics, Entrepreneurship, Business Development, Global Business, Risk Management, Ethical Responsibility, Problem Solving And Analytical Thinking" },
  { firstName: "DEVAPANGU", lastName: "DIVYA", email: "divyadevapangu05@gmail.com", phone: "9502929585", skills: "Recruitment & Selection, Resume Screening, Interview Scheduling & Coordination, Employee Engagement Support, Job Portals (WorkIndia, Job Hai), MS Excel (Pivot Tables, Dashboards, VLOOKUP), Communication & Collaboration" },
  { firstName: "Anu Priya", lastName: "Muddana", email: "anupriya.muddana1@gmail.com", phone: "+91 9391986879", skills: "Talent Management, Employee Engagement, Leadership, Strategic Planning, Communication, Time Management, Analytical Thinking, Interpersonal Skills" },
  { firstName: "Tanisha", lastName: "Gupta", email: "tanishagupta835@gmail.com", phone: "+91 7856075307", skills: "MS-Word, MS-PowerPoint, MS-Excel, Tally" },
  { firstName: "SANYUKTA", lastName: "SINGH", email: "sanyukta02singh@gmail.com", phone: "+91-9039780900", skills: "Interview Scheduling, Resume Screening, Recuritment & Selection, Employee Onboarding, Candidate Documentation, Candidate Sourcing, Proficiency in MS-Office" },
  { firstName: "Vartika", lastName: "Pandey", email: "vartikapandey015@gmail.com", phone: "9921428814", skills: "Salesforce, CRM Tools, Data Visualization, Power BI, Tableau, Omni-Channel Solutions, MIS, MS OFFICE, Advanced Excel" },
  { firstName: "Parth", lastName: "Maheriya", email: "parthmaheriya2279@gmail.com", phone: "+91-9054225080", skills: "Microsoft Excel, Word, Powepoint, Power Bi, Python, Tableau, SQL, Canva" },
  { firstName: "Shalini", lastName: "Sudhakumari", email: "shalini.nairmt@gmail.com", phone: "9886940218", skills: "Data Warehousing, Business Intelligence, ETL pipeline development, Data Modeling, Performance Optimization, Analytics, Snowflake, MSBI, AWS, SQL Server, SQLDBM, ERWIN, Dimensional Modeling, Snowflake, AWS S3, Data Replication, Reverse Engineering, Pipeline design, ELT tools, Matillion, Streamsets, DBT, ER model, SQL, MDX, SnowSQL, Kalido, Panorama, SSRS, Predictive Analytics, Presales, Requirement Gathering, Data Strategy, Technical design documents, Mentoring" },
  { firstName: "Anil Kumar", lastName: "Singh", email: "ak2030ad@hotmail.com", phone: "8708679379", skills: "Database Architecture, Data Management, Data Modeling, ERwin, SVN, Git, Visio, DB2 UDB, Oracle, Sybase ASE, SQL Server, MySQL, PostgreSQL, AWS RDS, AWS Aurora, MongoDB, Neo4j, Couchbase, Redis, Snowflake, AWS Redshift, AWS Redshift Spectrum, Hadoop, Netezza, AWS Glue, Apache Kafka, Apache Spark, Informatica, Talend, Autosys, Bash, Python, Collibra, Scrum, Jira, Project Management, Stakeholder Management, Release Management, Change & Incident Management, People Management, DevOps, Application Support, Microservices, Spring Boot, Angular, Tomcat, Docker, Java" },
  { firstName: "", lastName: "", email: "arjun20_50live.com", phone: "(+91) 9106615482", skills: "B2B Enterprise Sales, CRM Management, Business Analysis, Product Marketing, Consultative Selling, GTM Strategy, AI SaaS, Zoho CRM, HubSpot, Salesmate, Zendesk, Intercom" },
  { firstName: "Neeraj", lastName: "Soni", email: "neerajsoni2211@gmail.com", phone: "+91 9881925087", skills: "SAP SD, SAP S/4 HANA SALES, SAP S/4 HANA Cloud Private Edition, Transportation Management, SAP Sales And Distribution, BBP, KDS document creation, Copy Control, Pricing Procedure, Ticketing Tool, Customization and Configuration of Order Types, Contract, Item category, Schedule Line Categories, Revenue Recognition, Customer Master Data, Material Master Data, Customer-Material Info Records, Delivery Types, Billing Types, Inter-Company Sales, STO, Output Determination, Route Determination, Pricing in sales documents, Jira Ticketing Tool, Enhancements and Reports, API Development and Testing, End Users Training, MS Word, MS Office, Excel, PowerPoint, Outlook" },
  { firstName: "TULASI", lastName: "BADIGER", email: "tulasibadiger06@gmail.com", phone: "+91-7204906627", skills: "Project Management Skills, Teamwork, Collaboration, Communication Skills, AutoCAD, Problem Solving" },
  { firstName: "Vamshik", lastName: "Raju K S", email: "vamshik.miles@gmail.com", phone: "+91 9108880161", skills: "Autodesk AutoCAD, Autodesk Chief Architect, Microsoft Office (Excel, Word, PowerPoint)" },
  { firstName: "", lastName: "", email: "", phone: "", skills: "AutoCAD, SketchUp, EnScape, PPT, MS Word, MS Excel" },
  { firstName: "VISHAL", lastName: "PATIL", email: "vishalvpatil0001@gmail.com", phone: "6362619044", skills: "Survey, Auto-CAD, Revit Architecture, STAAD Pro, ETABS, SketchUp, Building Information Modelling, 3Ds Max" },
  { firstName: "Timoranjan", lastName: "", email: "timoranjan111@gmail.com", phone: "+91 8296336233", skills: "Technical, 3D Models (Skecthup), Autocad, Sketchup, v-ray, Modular Design, civil work, services, customer service, teamwork" },
  { firstName: "VIDYASHREE", lastName: "KULKARNI", email: "333shreevidya333@gmail.com", phone: "+917795344633", skills: "AutoCAD, Project Management, Public Relations, Teamwork, Time Management, Leadership, Effective Communication, Critical Thinking, Python" },
  { firstName: "VIDYA", lastName: "KULKARNI", email: "vidkulkarni741@gmail.com", phone: "+91 7483131872", skills: "AutoCAD, Photoshop, SketchUp, Microsoft office, Adobe Creative Suite, Illustrator" },
  { firstName: "Moosi", lastName: "Srilakshmi", email: "srilakshmikrishna2668@gmail.com", phone: "7893685661", skills: "AutoCad, Revit, Staad pro" },
  { firstName: "Shraddha", lastName: "Bagati", email: "shraddhabagati152@gmail.com", phone: "9880465662", skills: "AUTOCAD, 3DS MAX, GOOGLE SKETCHUP, REVVIT, VASTU, MS EXCEL, MS WORD" },
  { firstName: "BALANAGU MAHESH", lastName: "BABU", email: "maahimahesh1406@gmail.com", phone: "+91 97059 52838", skills: "Auto CAD, Sketchup, 3DS Max, Vray Rendering, Enscape, Art Campro, Revit" },
  { firstName: "MUTHU YOGESH", lastName: "M.S", email: "muthuyogeshofficial@gmail.com", phone: "6382747050", skills: "Auto CAD, Sketchup, Revit, Lumion, MS-Office" },
  { firstName: "P", lastName: "TRILOCHAN RAO", email: "trilochanrao4@gmail.com", phone: "9438548705", skills: "Auto CA, SketchUP, Microsoft Office- MS Word, MS Excel, MS PowerPoint" }
];

const processSkills = (skillsString) => {
  if (!skillsString || skillsString.trim() === '') return [];
  return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
};

const saveSkillsToDatabase = async (skills, userId, organization) => {
  if (!skills || !Array.isArray(skills) || skills.length === 0) return;
  try {
    for (const skillName of skills) {
      if (!skillName || typeof skillName !== 'string') continue;
      const skillNameLower = skillName.toLowerCase().trim();
      const existingSkill = await Skill.findOne({ name: skillNameLower, organization: organization });
      if (existingSkill) {
        await Skill.findByIdAndUpdate(existingSkill._id, { $inc: { usageCount: 1 } });
        console.log(`  ✓ Updated skill: ${skillName}`);
      } else {
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

const importCandidates = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

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
        if (!candidateData.email || candidateData.email.trim() === '') {
          console.log(`⊘ Skipping: ${candidateData.firstName} ${candidateData.lastName} (no email)`);
          skipCount++;
          continue;
        }

        const existingCandidate = await Candidate.findOne({ email: candidateData.email });
        if (existingCandidate) {
          console.log(`⊘ Skipping: ${candidateData.firstName} ${candidateData.lastName} (already exists)`);
          skipCount++;
          continue;
        }

        const skills = processSkills(candidateData.skills);
        const candidate = new Candidate({
          name: `${candidateData.firstName} ${candidateData.lastName}`.trim(),
          email: candidateData.email,
          phone: candidateData.phone,
          skills: skills
        });

        await candidate.save();
        console.log(`✓ Created: ${candidate.name} (${candidate.email})`);

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

importCandidates();


