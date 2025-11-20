const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('./models/Candidate');
const Skill = require('./models/Skill');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

const candidatesData = [
  { firstName: "AKASH", lastName: "SHARAM", email: "88510755as@gmail.com", phone: "8851075511", skills: "Menu designing, Search engine optimization, Computer, Logon design, Cooking, Photography" },
  { firstName: "Rahul", lastName: "Gautam", email: "", phone: "7827320253", skills: "" },
  { firstName: "ANIL", lastName: "SINGH", email: "anilsinghkumar3344@gmail.com", phone: "+91- 7042108267", skills: "" },
  { firstName: "sanjay", lastName: "singh", email: "sanjaysinghrawat840@gmail.com", phone: "8938866732", skills: "Inwantry control, FOOD SAFETY AND SANITATION, Knife skills and food preparation, Menu design and recipes creation, LEADERSHIP AND MANAGEMENT, UNDERSTANDING INGREDIENTS AND SEASONING" },
  { firstName: "Sanjeev", lastName: "Kumar", email: "ksanjeev24342@gmail.com", phone: "+91-9999 028 110", skills: "Kitchen Managemnt, Busnisse Developmnet, Staff Leadershif, Menu Degine, Inventory Management, Process improvement, Cost control, Minimum Wastage, Supervises Kitchen staff, Quality improvement, plans nad Direct food preparation, Recipe Making, Posist, Easypos, PetPuja, MS Office (Word, PowerPoint, Excel)" },
  { firstName: "Ankit", lastName: "Patwal", email: "ankitpatwal95@gmail.com", phone: "+91-8744849600", skills: "Food Production, Continental hot, continental cold, garde manger" },
  { firstName: "Ramesh", lastName: "Chandra", email: "chandraramesh0364@gmail.com", phone: "+918826166967", skills: "" },
  { firstName: "SNEHAL", lastName: "GANGODE", email: "snehgangode2151@yahoo.com", phone: "8390703353", skills: "" },
  { firstName: "PRERNA", lastName: "MOTWANI", email: "prernamotwani09@gmail.com", phone: "7208972730", skills: "Verification procedure, Research, Primary source verification, Database update, Student onboarding, Orientation, Conflict resolution, Loan advisory, Financial counselling, Document collection, Negotiation" },
  { firstName: "Avni", lastName: "Sharma", email: "avnisharma820@gmail.com", phone: "7678460336", skills: "Talent Acquisition, Technical Recruiting, LinkedIn Outreach, Job Portals, Pay Rate Negotiation, MS Office, Compliance, Market Research, Database Management, Job Posting, End to End Recruitment" },
  { firstName: "Disha", lastName: "Patil", email: "dishaborsepatil324@gmail.com", phone: "7420910324", skills: "Leadership, Team Management, Effective Communication, Public Speaking, Strategic Thinking, Event Planning, Execution" },
  { firstName: "Faiyaz Muhammad Qasim", lastName: "Chougle", email: "fayyaz_mqc@yahoo.com", phone: "8828105271", skills: "Advance MS Office Application, CRM, ERP Software, Internet, ChatGPT, AI, Digital Marketing, Sales, Marketing, Business Development, MIS, Social Media, ERP/CRM software (ATLANTA ATAC, TRIO, SOFT.COM, MERRITO, VRITTI (EKATM)), School Management Software, AUTOCAD, CNC Machine (SATRONIK EXPERT SOFTWARE)" },
  { firstName: "Shivam", lastName: "Pal", email: "Kumar.shivam78656@gmail.com", phone: "9069990867", skills: "Communication skills, Computer literacy, Microsoft word, Microsoft excel, Documentation review" },
  { firstName: "Vijay", lastName: "Mehra", email: "vijay.mehra1962@gmail.com", phone: "+91 76789 57971", skills: "Cashier, Kitchen, iii Commi, ii Commi, i Commi, Head Chef, Basic Chinese, Basic Continental, Basic South Indian, Main North Indian" },
  { firstName: "VISHAN", lastName: "CHOUDHARY", email: "", phone: "8800128966", skills: "Basic knowledge of Computer" },
  { firstName: "Neha", lastName: "Chaudhary", email: "nehachaudharynsc10@gmail.com", phone: "+91 9821247551", skills: "MS-Office, Advance Excel, GoogleSuites, SQL, HTML, PowerBI" },
  { firstName: "Laxman", lastName: "", email: "laxing1995@gmail.com", phone: "918799735248", skills: "Basic knowledge of Computer, Petpooja Software" },
  { firstName: "Akashkumar", lastName: "PANCHAL", email: "akashpanchal25072000@gmail.com", phone: "+91-9867245847", skills: "" },
  { firstName: "KAJAL", lastName: "NAGRALE", email: "kajalnagrale.com@gmail.com", phone: "+91 8856092465", skills: "Loan Structuring (Education Loans), Financial Eligibility Assessment, Relationship Management (Banks, NBFCs and Partners), Documentation Review, Compliance (KYC, AML), CRM Tools, Excel, Microsoft" },
  { firstName: "Harish", lastName: "More", email: "Harishmore14@gmail.com", phone: "9702160944", skills: "MS-office, Tally ERP 9, English Typing" },
  { firstName: "Nitin", lastName: "Peswani", email: "nitinpeswani45@gmail.com", phone: "7020359948", skills: "Client Relationship Management, MS office, Technical Analysis, Portfolio Construction, Tally, ERP" },
  { firstName: "Navya", lastName: "Sripathi", email: "gujje30@gmail.com", phone: "+91-9890047047", skills: "MS Excel, MS Word, PowerPoint, MIS reports, Data sort, Data validation, Pivot, Vlookup, Hlookup, Process metrics management, Quality control, Customer complaint resolution, Training, Process audit, Root cause analysis, Coaching, Presentation" },
  { firstName: "SURAJ", lastName: "SHARMA", email: "msfsahrma@gmail.com", phone: "+91- 9653392899", skills: "Sales, Lead Generation, Marketing, MIS, Digital Security, Software Management" },
  { firstName: "TAUFIK", lastName: "AHMADKHAN", email: "taufiqkhan511@gmail.com", phone: "7021423510", skills: "Microsoft office, Leadsquare ERP, Salesforce ERP" },
  { firstName: "Mohammed", lastName: "Rashid", email: "mrmdrashid58@gmail.com", phone: "919766976822", skills: "Strategic Planning, Customer Retention, Sales Forecasting, CRM Systems, Team leadership, Business development, direct sales, B2C, SAAS SALES" },
  { firstName: "Sayli", lastName: "Molane", email: "sayali.molane@gmail.com", phone: "7208660545", skills: "Up-selling, cross-selling techniques, B to B sales, Account management, Business development and planning, Client satisfaction-driven, Effective Communication, Problem Solving, Teamwork, Responsibility, Time Management, Leadership, Hardworking, Multitasking, MS Excel, MS Word" },
  { firstName: "Roshan", lastName: "Rai", email: "roshanharendrarai@gmail.com", phone: "(+91) 9653395683", skills: "Sales" },
  { firstName: "SAHIL", lastName: "BAHADKAR", email: "sahilbahadkar5783@gmail.com", phone: "+91 7666055346", skills: "Sales & Marketing, Publicrelations, Leadership, Effective communication, Team Work" },
  { firstName: "Sweta", lastName: "Chaturvedi", email: "chaturvedisweta406@gmail.com", phone: "+91-9389352767", skills: "Sales Strategy & Execution, ATL/BTL Campaign Management, Customer & Vendor Relations, Team Handling & Development, Verbal and Written Communication, Analytical Thinking, Solution-Oriented Approach, Basic Troubleshooting, System Navigation, Technical Awareness" },
  { firstName: "Sameer", lastName: "Bisht", email: "bishtsameer9@gmail.com", phone: "+91 7977259634", skills: "Digital Marketing, Negotiation, Presentation Skills, Microsoft Excel, SQL, Tableau, Power BI, Python, Java" },
  { firstName: "Ashish", lastName: "Rai", email: "Ashishrai4050@gmail.com", phone: "7400109203", skills: "B2B Sales Strategy, Lead Generation and Qualification, Pipeline Management, Consultative Selling, Deal Closure and Negotiation, Cross-Selling and Upselling, Understanding of SaaS Solutions (e.g., CRM, ERP, FMS, TMS), Cloud Computing Knowledge, Basic IT Infrastructure Understanding (e.g., APIs, software integrations), Data Analysis and Reporting, Account Management, Building and Maintaining Long-Term Client Relationships, Product Demonstrations and Presentations" },
  { firstName: "Supreet", lastName: "Chhabra", email: "supreet.chhabra92@gmail.com", phone: "+918850945582", skills: "Visa processing, H-1B petitions, LCA forms, US Stamping process, Documentation, Report preparation" },
  { firstName: "SHARMILA", lastName: "LOKHANDE", email: "ahersharmila@gmail.com", phone: "9819305440", skills: "Training and Development, Quality Controls, Customer Service, Reporting Management, Cross-Functional Team Leadership, Managing Operations and Efficiency, Performance Evaluations, Team Leadership, MS Office" },
  { firstName: "Shruti", lastName: "Bhogle", email: "shrutibhogleqc78t_cfe@indeedemail.com", phone: "8097238594", skills: "sales leadership, operations, HR, recruitment, team management, business growth strategies, client relationship management, process optimization, talent acquisition, onboarding, compliance, payroll, employee engagement, IT procurement, financial administration, vendor negotiations, digital transformation, sales planning, administration, financial management, recruitment, training, employee engagement, budgeting, expense tracking, cost optimization, technology solutions, automation, IT procurement, infrastructure support, contract negotiation, digital tools, recruitment, onboarding, sourcing, screening, interviews, offer negotiations, candidate database maintenance, HR documentation, payroll, travel management, expense management, training programs, employee engagement activities, welfare initiatives, talent acquisition methods, job portals, mass mailing, direct sourcing, HR records, external agency coordination, expense report review, career counseling, lead generation, marketing strategies, MS Excel, MS Word, cold calling, client reports, presentations, communication, persuasion, team-building" },
  { firstName: "Aliva", lastName: "Chatterjee", email: "alivachatterjee32@gmail.com", phone: "7003673736", skills: "Project Management, Student Admission" },
  { firstName: "Santosh", lastName: "Jagtap", email: "santoshvjagtap2011ous5t_6f5@indeedemail.com", phone: "+91 99301 60806", skills: "Sales, Organisational skills, Leadership, Customer service, Communication skills, Business development, Customer relationship management, Strategy, Customer acquisition" },
  { firstName: "Roshani", lastName: "Tiwari", email: "roshanitiwari85_6f7@indeedemail.com", phone: "+91 91367 65350", skills: "Mscit, Marketing, Tally, Sales" },
  { firstName: "Ghausia", lastName: "Usmani", email: "ghausiausmanipn439_6pp@indeedemail.com", phone: "+91 81695 28290", skills: "Communication skills, Customer service, Customer support, Leadership" },
  { firstName: "Sisir", lastName: "SWAROOP", email: "Sisir431@gmail.com", phone: "8297114546", skills: "Lead Generation, CRM, Cold Calling, Email Campaigns, Sales Prospecting, Training & Development, KPI Achievement, Social Selling, Strategic planning, Public Relations, Project planning and coordination, Strategic Sales Planning" },
  { firstName: "Parul", lastName: "Kataria", email: "parul.kataria96@gmail.com", phone: "9999677093", skills: "Tally ERP-9, MS Office, Excel, Data Analysis, CRM tools, Video Editing, MIS Reporting" },
  { firstName: "Sayali", lastName: "Lihe", email: "sayaliilihe@gmail.com", phone: "8657664547", skills: "Advance Excel, Tally, Digital Marketing, CRM Management, Python, Power BI" },
  { firstName: "Sumedh", lastName: "Jawale", email: "sumedhjawale007@gmail.com", phone: "+971 52 871 8763", skills: "Strategic B2C Sales, Customer Conversion, Salesforce, Zoho, HubSpot, Intercom, Team Leadership, Coaching, Performance Monitoring, Travel Planning, Client Personalization, Problem Solving, Empathy-Driven Communication" },
  { firstName: "Mohsin", lastName: "Shaikh", email: "mshaikh239@gmail.com", phone: "8879487106", skills: "Sales, Operations, Cold calling" },
  { firstName: "Abdullah", lastName: "Mazhar", email: "abdullahmazhar05@gmail.com", phone: "+91 9810851744", skills: "Banquet Operations, Staff Supervising, Guest Relation, Human Resource, Security, Housekeeping, Public Relations, F&B Service, Sales, Finances, Training Programs, Customer Focus, Communication, Inter-personal, Liaison, Problem Solving, Event Management, Business Development" },
  { firstName: "", lastName: "", email: "swatitale11@gmail.com", phone: "087669 48904", skills: "Sales Initiatives, Client Relationship Management, Sales Planning, Team Leadership, Business Development, Product Knowledge" },
  { firstName: "Janhavi", lastName: "Gaikwad", email: "janhavigaikwad2000@gmail.com", phone: "+91 8928795722", skills: "DIGITAL MARKETING, SOCIAL MEDIA MARKETING, SEO, MS-OFFICE" },
  { firstName: "SHRADDHA", lastName: "BHATT", email: "shraddhamore0213@gmail.com", phone: "7738990655", skills: "MS Office Suite, Excel, CRM Tools, Customer Support, Team Leadership, Technical Proficiency, Administrative Support" },
  { firstName: "JAIBUN", lastName: "NISHA", email: "jaibun412@gmail.com", phone: "+91-9798077771", skills: "Sales&Service Support, Relationship Building, Problem Solving, Communication Skills, Time Management, Researching Markets, Outbound & Inbound sales, New business generation, Business relationship cultivation, Developing sales strategies and packages, Ms Office (Excel,word,Presentation.etc), Maintaining client record(CMR)" },
  { firstName: "Amartya", lastName: "Samanta", email: "samantaamartya18@gmail.com", phone: "9773843631", skills: "Microsoft Office, AUTO CAD, Ansys work, solid works" },
  { firstName: "Ankhi", lastName: "Mondal", email: "ankhimondal78@gmail.com", phone: "+91-9321550278", skills: "Strategic Planning, Revenue Generation, Business Growth, Business development management, Client Relationship Management, Administration Management, Team Mentor, Student Counseling, Career Development, Communication Skills" },
  { firstName: "Shafa", lastName: "Shaheen", email: "shafa19may1993@gmail.com", phone: "9102211328", skills: "MS OFFICE, TALLY, GST, CRM" },
  { firstName: "Shraddha", lastName: "Rankhambe", email: "shraddhaar15@gmail.com", phone: "+918169664735", skills: "Student Counseling, Admissions, Academic Advising, Overseas Education, High-Ticket Sales, Lead Conversion, Upselling, Target Achievement, Relationship Management, Communication, MS Office, Advanced Excel, CRM (LSQ, Freshsales, Freshworks, Zoho), SEO, Google Ads, Canva, content writing" },
  { firstName: "Pranav", lastName: "Sawant", email: "spranav3225@gmail.com", phone: "9167459404", skills: "MS Word, MS PowerPoint, MS Excel" },
  { firstName: "Manushi", lastName: "Bhadoriya", email: "manushi2145@gmail.com", phone: "+91 9589743174", skills: "" },
  { firstName: "Ramesh", lastName: "Shinde", email: "rrshinde998@gmail.com", phone: "8554072208", skills: "Salesforce, OCRM, MS-Office, Tally, MS-CIT" },
  { firstName: "Sahil", lastName: "Sambyal", email: "sahilsambyal7676@gmail.com", phone: "+917838314647", skills: "Advertising and Marketing management, Account management, Client servicing, PR and Media relations, Team leadership" },
  { firstName: "KAUSTUBH", lastName: "PAGARE", email: "pagarekaustubh@gmail.com", phone: "8779864377", skills: "BTL Marketing & Activation, Event Planning & Execution, Lead Generation Strategy, Strategic Partnerships, Market Research & Analysis, Campaign Management, Team Leadership & Training, Vendor Coordination, Brand Positioning, ATL/BTL Campaign Execution" },
  { firstName: "Chinmay", lastName: "Sawant", email: "chinmaysawant024@gmail.com", phone: "9920235871", skills: "Leadership Ability, Negotiation, Problem Solving, Team Player, Time Management" },
  { firstName: "GOUTHAMAN", lastName: "ASOKAN", email: "siddharthgoutham28792@gmail.com", phone: "+919384918773", skills: "Project Management, Leadership, Market Research, Public Relations, Branding, Sales, Client Relationship Management, SEO and Social Media Marketing, Content Marketing, Analytics, Contract Negotiation, Training and Development" },
  { firstName: "Snehal", lastName: "Shinde", email: "Snehal.professional@gmail.com", phone: "8850487728", skills: "Student & Career Counseling, Institutional & B2B Sales, International Education & Immigration Advisory, IT & Digital Marketing Training Sales, Client Relationship Management (CRM), Public Speaking & Presentations, Lead Generation & Conversion, Target Achievement & Team Collaboration" },
  { firstName: "Krishna", lastName: "Singh", email: "techiedude6@gmail.com", phone: "8210099110", skills: "Inside sales, hot calling, cold calling, operation, Team Handling, Holiday packages sales, CRM (Oracle, Salesforce, Lead squared), Microsoft Word, PowerPoint, Excel, outbound sales, inbound sales, sales strategies, negotiation, customer service, report making" },
  { firstName: "Salman", lastName: "Pathan", email: "salmanp838@gmail.com", phone: "+91 84220 57708", skills: "Client relationship, B2B Sales, Lead Generation & Qualification, CRM Tool (Freshsales CRM), Ms Excel" },
  { firstName: "Ashwani", lastName: "Kumar", email: "ashukumardxb@gmail.com", phone: "+91 9811634555", skills: "Operations Management, Event Management, Vendor Negotiation, Budget Management, Staff Scheduling, Food & Beverage Service, Inventory Management, Customer Service, Team Leadership, Cost Control, Sales Reporting" },
  { firstName: "NIYATI", lastName: "MEHTA", email: "niyati.sheth@gmail.com", phone: "+91 9987108696", skills: "Client Relationship Management, Program & Application Coordination, Marketing & Sales Support, Administrative Operations" },
  { firstName: "Nazia", lastName: "Sayyed", email: "nzs2412022@gmail.com", phone: "", skills: "MS Office, Internet use for research, Identifying prospective corporate customers, Approaching prospective customers, Meeting concerned persons, Handling queries, Making sales, Closing deals, Customer Service, Outbound process, Inbound calls, Email coordination, Communication Skills, Negotiation skills, Selling skills, Target oriented, Convincing skills, Market knowledge" },
  { firstName: "JOEL", lastName: "FERNANDES", email: "joelfernandes94@gmail.com", phone: "+91 9004761855", skills: "MS-Office, Word, PowerPoint, Excel (V Lookup, Pivot Table), Internet Applications, Negotiation, Sales Presentations, Market Analysis" },
  { firstName: "ABOOZAR", lastName: "AGHA", email: "abuzarsheikh7985485954@gmail.com", phone: "+91 7985485954", skills: "Excel, Google Ads, SalesForce, Lead Squared, CRM" },
  { firstName: "RISHABH", lastName: "AGARWAL", email: "agarwalr140@gmail.com", phone: "+91 72909 74561", skills: "Sales, Marketing, Strategic Sales Planning, Banquet & Hospitality Sales, B2B Business Development, B2C Business Development, Client Acquisition, Client Retention, CRM, Lead Management, Revenue Growth, Conversion, Campaign Execution, Team Training" },
  { firstName: "SUNITA", lastName: "DEVI", email: "sunitaksh9571@gmail.com", phone: "+91-8787797841", skills: "Recruitment, Talent Acquisition, Employee Engagement, Communication, Relationship Management, Team Collaboration, Negotiation Skills, MS Office" },
  { firstName: "AQUEEB", lastName: "JAVED", email: "aqueebjaved96@gmail.com", phone: "9151594059", skills: "Communication Skills, Problem Solving, Decision-Making Skills, Web Designing, B2C, Lead Square, OCR Software, Marketing management, Digital Marketing Knowledge, SEO, Social Media Marketing" },
  { firstName: "Aakash", lastName: "Sonawane", email: "aakashsonawane82@gmail.com", phone: "7738780963", skills: "Brand-building strategies, Strategic planning, Negotiation tactics, Market analysis, Creative thinking, Relationship Management, Lead generation techniques, Sales training, Revenue growth strategies, CRM software proficiency, Sales forecasting, Cross-Functional leadership, Microsoft office suite proficiency" },
  { firstName: "Mayur", lastName: "Trivedi", email: "mayurtrivedi072@gmail.com", phone: "9322289283", skills: "Sales, Decision making, Negotiation, Problem-solving, Customer Relationship Management, Closing deals." },
  { firstName: "Vikash", lastName: "Srivastava", email: "srivastavs.v76@gmail.com", phone: "(+91) 8442815245", skills: "Restaurant Operations, F&B Service, Cost Control, Marketing Initiatives, Guest Relation, Banqueting, ODC (Outdoor Catering), Inventory Management, SOP Creation, POS Training, Beverage Licensing, Menu Specification, Event Planning" },
  { firstName: "SAKSHI", lastName: "SAWANT", email: "sawantsakshi2772@gmail.com", phone: "+91 9309707162", skills: "Career Counselling & Guidance, Sales Strategy & Negotiation, Customer Relationship Management (CRM), Event Coordination & Management, Content Creation & Communication, Strategic Planning & Analysis, Data Entry & Record Management, Team Collaboration & Leadership, ChatGPT, Marketing Strategy, Facebook Marketing and Advertising, Microsoft Excel, Search Engine Optimization (SEO), Canva, Influencer Marketing" },
  { firstName: "VARSHA", lastName: "KUNISE", email: "Kunisevarsha@gmail.com", phone: "+91 75062 55335", skills: "Advance Excel, Tally, CRM, Zoho, Atlas, LSQ, ERP, Salesforce" },
  { firstName: "Nilofar", lastName: "Mulla", email: "nilofarm9619@gmail.com", phone: "9004602573", skills: "Business Development, Strategic Planning, Sales and Marketing, Customer Relationship Management, Negotiation, Data Analysis, Team Collaboration, Microsoft Excel, CRM Systems" },
  { firstName: "Pallavi", lastName: "Wankhede", email: "pallaviwankhede45@gmail.com", phone: "9987915759", skills: "Management Skills, Time management skills, Teamwork, Entrepreneurial Skills, Strategic Thinking, Problem Solving Skills, Excel, Ms Office" },
  { firstName: "SNEHAL", lastName: "SAVANIYA", email: "snehalsavaniya13@gmail.com", phone: "+91 9892497749", skills: "Sales Pipeline Management, Business Development, Customer Relationship Management, Lead Prospecting, Lead Generation, Relationship Building, Client Consultations" },
  { firstName: "ANKITA", lastName: "PANDEY", email: "ankitakkpandey9@gmail.com", phone: "+91 7506119616", skills: "Microsoft Word, Microsoft Excel, MS PowerPoint" },
  { firstName: "RIYA", lastName: "PHODKAR", email: "riyavp05@gmail.com", phone: "+917900174296", skills: "Microsoft Office, Customer relationship management" },
  { firstName: "Abhishek", lastName: "Yadav", email: "0902yadavabhishek@gmail.com", phone: "7738033477", skills: "Carrier counseling, Objection Handling, Profile Analysis, Mentorship, Spreadsheet, Excel, CRM (Salesforce, LSQ), ERPs, Market Research, Development, B2B Collaborations, B2B Sales, Marketing, Leadership, Strategic Planning, Effective Sales Communication, Need Assessment, GenAI tools (GPT 4.0, Perplexity Canva AI), Risk Analysis, Project Management" },
  { firstName: "Saurabh", lastName: "Shendge", email: "saurabh.shendge220297@gmail.com", phone: "9819586410", skills: "" },
  { firstName: "ROHAN", lastName: "SHETH", email: "rohansheth54@gmail.com", phone: "8451090249", skills: "E-commerce Management, Business Development, Key Account Management, Data Analysis & Reporting, Customer Relationship Management (CRM), Strategic Planning & Execution, Market Research" },
  { firstName: "SURAJ", lastName: "SURYAWANSHI", email: "surajsuryawanshi122@gmail.com", phone: "9321274190", skills: "Product Knowledge, Communication skills, Customer service skills, Sales & marketing skills, CRM" },
  { firstName: "SALONI", lastName: "CHALKE", email: "salonichalke86@gmail.com", phone: "+91 9653645594", skills: "Student Counseling, Visa Processing, Team Supervision, Strategic Student Support, Digital Marketing, Social Media Management" },
  { firstName: "ANKIT", lastName: "JAIN", email: "ankitljain101@gmail.com", phone: "8123446101", skills: "sales, marketing, accounts, taxation, GST, tally, Online Banking Transactions, NEFT, RTGS, IMPS, Inter-Bank Transfers, MS Excel, Word, PowerPoint" },
  { firstName: "Akshata", lastName: "Sable", email: "sableakshata44@gmail.com", phone: "7499399028", skills: "Lead generation, cold calling, prospecting, sales presentations, negotiation, closing deals, Client Relationship Management, Communication, Market Research, Team Collaboration, Time Management, Problem Solving, Negotiation Skills, Presentation & Demos" },
  { firstName: "Avinash", lastName: "Singh", email: "avinashsbhadoria@gmail.com", phone: "+91-7507233866", skills: "Product Research & Expertise, CRM Tools Proficiency, Microsoft Excel & PowerPoint" },
  { firstName: "Manoj", lastName: "M", email: "manoj.manuguli@gmail.com", phone: "08073657633", skills: "Building Information Modeling (BIM), Revit, Revit Architecture & MEP, AutoCAD, AutoCAD Plant 3D, SketchUp, 3D Modeling & Visualization, 3ds Max, Point Cloud to CAD Conversion, Enscape, Electrical & Plumbing Layout, Interior Space Planning, Lumion" },
  { firstName: "Rishabh", lastName: "Nagpal", email: "rishabhnagpal8@gmail.com", phone: "8938853304", skills: "Inside Sales Leadership, Team Building & Coaching, Digital Sales Strategy, Sales Process Optimization, Cross-functional Collaboration, CRM & Sales Tools (Salesforce, Zoho), Sales Analytics & Forecasting, Behavioral Data-driven Selling, Target Setting & Performance Review, Customer Journey Mapping, Retention & Upselling Strategy, Modern Sales Enablement, Advanced MS Excel" },
  { firstName: "Kratika", lastName: "Bajpai", email: "kratika.bajpai17aug@gmail.com", phone: "+91- 9936482614", skills: "SuccessFactors, Leadership Referral Tracking (LRT) Portal, ATS" },
  { firstName: "NIDHI", lastName: "SHARMA", email: "nidhi11augsharma@gmail.com", phone: "(+91) – 8800752674", skills: "Sales, Marketing, Business Development, Key Account Management, Recruitment Delivery, Operation Management, Team Hiring and Management, Performance Management, Training programs, Process Improvements, Business Planning, Attrition Management, Managing P&L, Lead Generation, Client Servicing, Market Research, Strategy Formulation, Presentation, Proposal Submission, Negotiation, Sales Closing, Competitor Analysis, Media Planning, Software: Windows 95/98/2000/XP, MS-Office, HTML, Internet" },
  { firstName: "Abhishek", lastName: "", email: "singh.abhishek8742@gmail.com", phone: "7895336969", skills: "Technical recruiting, Recruitment Cycle, Resume sourcing, Boolean keywords, Client relationship management, Negotiation, Closure skills, Job Diva, Candidate screening, Talent acquisition, Recruitment strategies, Candidate placement, Candidate interviewing, Salary negotiation, Onboarding, Resume database building" },
  { firstName: "Garima", lastName: "Jain", email: "garimajain158@gmail.com", phone: "+91 8302456510", skills: "Recruitment, IT Recruitment, Sourcing, FTE, Head hunting, Talent acquisition, Compensation negotiation, Employee relationship, Organizing, Coordinating, Management skills, Performance Testing, Automation Testing, Manual Testing, Java, J2ee, JSP, JDBC, Core Java, Java Script, HTML, Hibernate, Windows, UNIX, AIX, Linux, VMWare, ASP dot net, C#, WCF, WPF, MVC, Azure, SQL, PL/SQL, Oracle, DB2, My SQLDBA, C, C++, Networking, Network Security, Application Security, SOC, Siem" },
  { firstName: "Prachi", lastName: "Jain", email: "jprachi7030@gmail.com", phone: "9899345505", skills: "Operating system, Windows XP to Windows 11, Handling of apparatus including Dissolution apparatus, Disintegration apparatus, Friability testing apparatus, Leakage testing apparatus, Handling of instruments as UV-Spectroscopy, FTIR Spectroscopy, pH meter, Ultra sonicator, weight variation of tablets and capsules" },
  { firstName: "Disha", lastName: "Das", email: "dishaa28dec@gmail.com", phone: "+91 8210357092", skills: "Lead Generation, Demand Creation, Sales Strategy, Pre-Sales Support, CRM, Event Marketing, Delegate Acquisition, Client Servicing, Relationship Management, Cross-functional Team Collaboration, Dashboard Publishing, Report Publishing, Marketing Communications, Business Development" },
  { firstName: "Fayaz", lastName: "Ahemed JH", email: "fayazahamed528@gmail.com", phone: "8310853021", skills: "Client onboarding and account management, B2B, B2C, and SaaS expertise, CRM proficiency: HubSpot, Zoho, Lead Squared, Team leadership, Communication and negotiation skills, Strategic upselling and cross-selling, Project coordination, Data analysis and forecasting, Contract negotiation and vendor registration, Lead generation strategies, Customer onboarding and product adoption, Client relationship management, Feedback integration" },
  { firstName: "MEGHAVATH", lastName: "SANTHOSH", email: "meghavathsanthosh075@gmail.com", phone: "+91 9849958075", skills: "Auto Cad, Sketchup, V Ray, MS Office, Photoshop, Coohom" },
  { firstName: "SOURABH", lastName: "JHA", email: "sourabhjha80@gmail.com", phone: "+91 9819899597", skills: "MS Office, Excel, PCB Design, 8051 Microcontroller, Arduino UNO, Analytical Lab Products, C/C++ Programming, MODBUS, TCP/IP Output Configuration, 4-20mA Output Connection, GEM Portal Handling, Tender Filing, Compliance, Product Demonstration, Negotiation Skills, Auction Bidding" }
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


