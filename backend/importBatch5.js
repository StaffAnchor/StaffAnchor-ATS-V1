const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('./models/Candidate');
const Skill = require('./models/Skill');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

const candidatesData = [
  { firstName: "P R A J A K T A", lastName: "G", email: "PRAJAKTA.GHANVATKAR@GMAIL.COM", phone: "+91 8669032052", skills: "SEO, SEM, Social media marketing, Content marketing, Analytics tools (Google Analytics, Google Ads), Autocad, Microsoft Office, ANSYS, Mastercam" },
  { firstName: "VIKRAM", lastName: "DHANVATE", email: "vikramdhanvate@gmail.com", phone: "+91 8286156804", skills: "Business Development, Project Management, IT Hardware & Software Domain, Alliance Management, Market Research & Competitive Analysis, Product Demos & Presentations, Cross-Functional Collaboration, Vendor Negotiation, Stakeholder Management, Jira, Figma, PowerBI, LMS-Moodle, WordPress, Esper-MDM, Google Suite, MS Office, SQL, HTML/CSS, IT Support, System Repairs, Network Troubleshooting, IT Procurement" },
  { firstName: "PRANAV", lastName: "NAIK", email: "ssnaik.pranav@gmail.com", phone: "7021427052", skills: "Business Development, Sales, Lead Generation, Client Acquisition, Negotiation, Revenue Growth, Market Analysis, Data Analysis, Competitive Research, Performance Metrics, Strategy Execution, Client Relationship Management, Customer Engagement, Retention, Communication, Networking, Strategic Partnerships, Stakeholder Engagement, Sales Presentations, Cross-Team Collaboration, Cloud Computing, Programming, C++, Python" },
  { firstName: "Papita", lastName: "Chavan", email: "chavanpapita@gmail.com", phone: "+ 918669787995", skills: "JIRA, Power BI, SQL, Excel, SAP, CRM, Pitchbook, AlphaSense, Capital IQ" },
  { firstName: "SUMEET", lastName: "HARIJAN", email: "sumeetkumar071@gmail.com", phone: "9930459938", skills: "Autocad electrical, MS office" },
  { firstName: "Dhiraj", lastName: "Chouhan", email: "dhirajchouhan279@gmail.com", phone: "+91 - 9437888279", skills: "Business Development, Communication, Negotiation, Market Knowledge, Financial products, Customer Serving, Management, Customer Acquisition, Critical Thinking, Leadership, CRM Operations, Sales negotiation, SaaS Agreement, CRM Maintenance, Post Sales coordination, Account Management" },
  { firstName: "Sunilkumar", lastName: "Tiwari", email: "suniltiwari123@gmail.com", phone: "9594662044", skills: "SaaS-based product sales, field sales, Bitrix CRM, digital signage software and hardware, outbound calls, customer relationship management, Marg ERP software, Router and Switches configuration, MIS report, TRI report, Bandwidth report, user authentication server, CMTS, STB, Media gateway server, Multicasting, Leased Lines monitoring, Access Control System, Fire Alarm System, Static and Dynamic routing protocols, IP route, RIP, IGRP, EIGRP, OSPF, BGP, WAN technologies, Lease line, ISDN, VSAT, VPN" },
  { firstName: "SUJIT", lastName: "YADAV", email: "sujitkumar87@yahoo.com", phone: "+91 9594100544", skills: "Cyber Security - NMAP, Burp suite, Nessus, VM tool, CRM Tool - Hub spot, Sapphire, RBI & SEBI Guidelines Compliance audit, Operating Systems - 2011/2010/2008/2007/ubuntu/XP, CCNA - Basic routing and switching, AD/Backup Utilities, Inside Sales, Direct Sales, Enterprise Account Management, Team Building, Leadership, Deadline Management, Product Knowledge, Hardware & networking, On-site and technical support" },
  { firstName: "MANISHA", lastName: "GANDHI", email: "manishasgandhi9@gmail.com", phone: "+ 919022118997", skills: "Sales, Marketing, Business Development, Corporate Selling, B2B Corporate Training, Sales Forecasting, Account Management, Contract Negotiation, Customer Interest Development, Business Strategy, Digital Transformation, Business Opportunity Generation, Client Relationship Management, Corporate Training Enquiries, Sales Team Management, Administrative Work, Market Research, Career Planning, Marketing & Sales Activity, Tele-calling, Report Preparation" },
  { firstName: "Abhishek", lastName: "Kumar", email: "abhishekk8826@gmail.com", phone: "8826484696", skills: "Enterprise Growth Strategist, Application based solutions and related services, Product and Service Sales, B2B Account Hunting & Account Farming, Lead Generation, Consultative, Value-Based & SPIN Selling, Sales Process Optimization & Customer Relationship Management Excellence, Team Leadership and Performance Management, Data-Driven Decision Making, Adaptability & Resilience, B2B SaaS/IT Sales, B2B, B2C EdTech Sales, B2B eCommerce Sales, Enterprise/Corporate Sales, Strategic Planning and Execution, Marketing and Sales Leadership, Solution Selling, Consultative Selling, Key Account Management, Account Nurturing, Relationship Management, Market Analysis, Product Knowledge, Cross-Functional Collaboration, Sales Process Optimization, Talent Acquisition, Data-Driven Decision Making, Leadership And Team Management, Process Building, Adaptability And Resilience, Learning And Development, Retention & Growth, Motivation For Sales, MS Office Package, MS Excel" },
  { firstName: "Akshay", lastName: "ANAND", email: "aksheyanand1992@gmail.com", phone: "8356990639", skills: "Operations Management, Process Optimization, Quality Control, Compliance, Team Leadership, People Management, Risk Management, Project Management, Strategic Planning, Execution, Budgeting, Financial Management, Change Management, Supply Chain Management, Vendor Management, Stakeholder Management, Cross-functional Collaboration, Operational Analysis, Reporting, Sales Strategy, Partnership Development, Lead Generation, Prospecting, Account Management, Client Relationship Management, Networking, Client Acquisition, Market Research, Competitive Analysis, International Business Development, Negotiation, Deal Closing, Sales Presentations, Pitches, Revenue Growth, Sales Forecasting, CRM, Salesforce, Zendesk, Exotel, SlashRTC, Data Analysis, Reporting" },
  { firstName: "AYAZ", lastName: "Ahmad", email: "ayaz.wayne@hotmail.com", phone: "09871756349", skills: "Salesforce CRM, Key Account Management, Channel Management, P&L Management, Revenue Growth, Lead Generation, Sales Strategy, MS Excel, Google Workspace, Cloud Platforms" },
  { firstName: "Satish", lastName: "Durgale", email: "skdurgale2021@gmail.com", phone: "9972683264", skills: "SAAS Sales, B2B/B2C Sales, Inside/Offline Sales, Portfolio Management, Sales Strategy & Execution, Customer Relationship Management (CRM), Team Leading & Performance Coaching, Onboarding & Training, Audit & Process Optimization, Project & People Management, Customer Service & Escalation Handling, SOP Creation & Workflow Improvement" },
  { firstName: "Tarun Kumar", lastName: "Sakkarwal", email: "sakkarwalt@gmail.com", phone: "+91-7838165172", skills: "Accounts handling, CRM- ZOHO, Hubspot, Data analysis, Negotiation" },
  { firstName: "Muneeb", lastName: "Sharar", email: "mmsharar@gmail.com", phone: ".9821745927", skills: "Key Account Management, B2B – Sales, Business Development, Farming, Hunting, lead generation, Account Mapping, Product sales, Services sales, negotiation skills, Excel, Word, Salesforce, Dynamics 365" },
  { firstName: "SHLOK", lastName: "CHOUDHARY", email: "shlok135135@gmaiI.com", phone: "+91-8287476751", skills: "Enterprise Sales, Business Development, Negotiation, SaaS Sales, Pipeline Management, Commercial Documentation, Relationship Development, CRM Management, Channel Management, Field Sales, Basic Data Interpretation, Insight Generation" },
  { firstName: "PRATEEK MOHAN", lastName: "SHRIVASTAVA", email: "prateek.mohan.shrivastava@gmail.com", phone: "+91 - 9407554786", skills: "Vendor Management, P&L Management, Sales Prospecting, Consultative Sales, Relationship Building, Stakeholder Management, Sales Strategy Development, Pipeline Management, Closing Deals, Persuasive Negotiation, Marketing Strategy, Data Analysis, Market Research" },
  { firstName: "Yash", lastName: "Nagrani", email: "yashnagrani@gmail.com", phone: "09870896620", skills: "Negotiation, Selling Skills, Customer Service" },
  { firstName: "Amit", lastName: "Saxena", email: "w.inningtheworld123@gmail.com", phone: "", skills: "Consultative Sales, B2B Software Sales, Enterprise Sales, Software Sales, Corporate Sales, B2B Sales, International Sales, Solution Sales, Sales, Software Solution Sales, Internet Sales, Sales/BD Manager, Ad Sales, Digital Sales, SAAS, Lead Generation, Account Management, CRM Systems, Strategic Sales Planning, Negotiation Skills" },
  { firstName: "RISHABH", lastName: "NAIR", email: "rishaabhnair@gmail.com", phone: "+91-9052777887", skills: "Inside Sales, Account Management, New Business Development, Consultative Selling, Client Needs Analysis, Solution Design, Sales Pipeline Management, Product Training, Customer Support, Stakeholder Engagement, Negotiation, Salesforce, MS Office Suite, MS Teams, Zoom" },
  { firstName: "Debraj", lastName: "Mukherjee", email: "rajadebraj@gmail.com", phone: "9223903221", skills: "Strategic Business Planning, Key Account & Relationship Management, Product & Portfolio Management, Sales, Marketing & GTM Strategy, P&L Ownership & Regional Expertise, Global Alliance & Vendor Management, Budgeting & Forecasting, Cost Optimization, Negotiation & Deal-Making Expertise, International Sales, Business Development, Financial & Risk Management, Data Analytics & Business Intelligence, People Leadership & Performance Management, MS Office Suite, CRM Systems- Zoho/Salesforce.com, ERP Systems, Data Analysis- Zoho Analytics" },
  { firstName: "Abhishek", lastName: "Shuklq", email: "abhishekshukla0134@gmail.com", phone: "7054440526", skills: "MS Office, GTM Strategy Development, Revenue Optimisation, LinkedIn Sales Navigator, Zoho, Market Research and Analysis, SaaS, Data Analysis, CRM Tool, Negotiation and Relationship, Sales Force, Team Leadership and Training" },
  { firstName: "Rohit", lastName: "Kumar", email: "Rohitsunny1993@gmail.com", phone: "7828264363", skills: "Sales Strategy, Business Development, Key Account Managenment, B2B Sales, IT Sales, B2C, Campaigns management, Negotiation & Deal closing, Client relationship, Lead Generation, CRM Management, Excel" },
  { firstName: "Alif", lastName: "shaik", email: "skalif088@gmail.com", phone: "8217577663", skills: "Prospecting & Lead Generation, Cold Calling & Objection Handling, Effective Sales Communication (Written & Verbal), B2B Sales Fundamentals & Consultative Selling, AI & Tech-Savviness (Prompt Engineering + Tools), Digital Branding & Visual Communication, LinkedIn Sales Navigator, CRM, Google Analytics, Tableau, Clay, Apollo.io" },
  { firstName: "Ashish", lastName: "Rai", email: "bhatt_ashish@outlook.com", phone: "09525514909", skills: "Strategic Alliances, Partnerships, Business Development, Revenue Growth, Sales Forecasting, Pipeline Management, Marketing Campaign Management, Client Relationship Management, Team Leadership, Training, Contract Negotiation, Market Research, Competitive Analysis" },
  { firstName: "Triveni", lastName: "", email: "triveni.rathi07@gmail.com", phone: "+91-8750587008", skills: "Sales CRM, Oracle ERP Accounting System, Genius- A complete solution software for TDS" },
  { firstName: "Isha", lastName: "Malik", email: "Malik150299@gmail.com", phone: "8178981118", skills: "Client acquisition, Nurturing, Listening Skills, Pipeline Management, Lead Generation, Customer Service, Performance Evaluations, Sales Presentations, Mergers and Acquisitions, Business Development, Issue Resolution, Networking strength, Team Collaboration, Relationship building and management, Sales channel building, Sales and market development, Marketing expertise, Market Analysis, Client Meetings, Client Follow up, Clients Screening, Sales Reporting, Data Analysis, Feedback Implementation, Client Acquisition, Relationship Building With Clients & Designated Hospitals, Cross Selling, D2C, Client Retention, Identify New Revenue Opportunities, Building Business Relationship with Current & Potential Clients, Maintain Database of Prospect" },
  { firstName: "Neha", lastName: "Sharma", email: "ssharmaneha0095@gmail.com", phone: "8787215901", skills: "Real Estate Sales & Marketing, Client Relationship Management, NRI Client Handling, Site Visit Coordination, Cold Calling & Lead Generation, Channel Partner Management, Property Presentations, Telecalling Team Coordination, Follow-up & Conversion, Project Promotion (Video/Online), Social Media Marketing, Market Trend Analysis, Negotiation & Closing Skills, Team Management, MS Office (Excel, Word, PowerPoint)" },
  { firstName: "Mitali", lastName: "Upadhyay", email: "Mitaliupadhyay99@gmail.com", phone: "9412458991", skills: "Microsoft Office, Word, Excel, PowerPoint, Management" },
  { firstName: "Rishabh", lastName: "Chaurasiya", email: "Rishabh2016chaurasiya@gmail.com", phone: "7408688240", skills: "Lead Generation, Client Relationship, Presentation Skills, Sales skills, Negotiation, Revenue Management, Market knowledge, Market Analysis, Internet, Excel, Google sheet, Lead Squared, Square beats CRM, Analytical skills, Logical skills, Communication skills" },
  { firstName: "HIMANSHI", lastName: "", email: "himanshiranga78@gmail.com", phone: "+91-8396011177", skills: "Customer Relationship Management, Client Services, Microsoft Office, Email Correspondence, Data Entry, Report Writing, Email Drafting, Client Presentations" },
  { firstName: "Dipti", lastName: "", email: "diptivashist72@gmail.com", phone: "9891968462", skills: "MS Office" },
  { firstName: "Sohana", lastName: "Shrivastava", email: "suhanashrivastava05@gmail.com", phone: "+91 6266679760", skills: "Client communication, Client relationship building, Sales strategy familiarity, Cold Emails & Calling, Lead generation, Problem solving, Proficient in CRM Software (salesforce, HubSpot), MS Excel, MS Office, Word" },
  { firstName: "Aditi", lastName: "Apurva", email: "apurvaaditi13@gmail.com", phone: "6207370852", skills: "Team leadership, Client communication, Problem resolution, Relationship building, Negotiation, Customer relationship management (CRM), Coaching and mentoring, Adaptability and flexibility, Empathy display, Complaint handling, Computer skills (MS Excel, Word, and PowerPoint), Problem-solving abilities" },
  { firstName: "Yashasvi", lastName: "Sainj", email: "yashasv2812@gmail.com", phone: "9812221811", skills: "Strategic Partnerships & B2B Account Management, Project & Product Management, Campus Hiring & Corporate Relations, Event Planning and Stakeholder Engagement, RPA Development (UiPath, Automation Anywhere), Web Development (WordPress, HTML/CSS), MS Office, CRM Platforms" },
  { firstName: "Sri", lastName: "Subhadutta", email: "Sri.Subhadutta@outlook.com", phone: "7978227018", skills: "Sales, B2B Marketing, Strategic Planning, Leadership, Business Development, Expansion, Strategic Alliances, Partnerships, Pricing Strategy, Negotiations, Product Marketing, Field Marketing, Lead Generation, Client Engagement, Stakeholder Engagement, Brand Management, Employer Branding, Budgeting, Cost Optimization, Customer Relationship Management, GTM Strategy, Cross Functional Collaboration, Marketing Communication, Digital Marketing, SEO, SEM, YouTube, Instagram, Facebook, Mobile, Email Marketing" },
  { firstName: "KASHISH", lastName: "CHAHAR", email: "chaharkashish4@gmail.com", phone: "8791648597", skills: "Microsoft Excel, CRM Tools, Ticketing Systems, Sales, After-Sales Support, Client Handling, Retention, Communication, Negotiation, Problem Solving, Coordination" },
  { firstName: "Sneha", lastName: "Tiwari", email: "snehatiwari9522@gmail.com", phone: "8929317883", skills: "CRM, MS Excel, MS Word, Google Sheet" },
  { firstName: "SANDEEP", lastName: "SHARMA", email: "sandeepnoni10@gmail.com", phone: "9996908668", skills: "Property & Inventory Management, Site Visit Scheduling, Deal & Payments Tracking, Reports & Analytics, Client Queries And Documentation, Payment Queries, Possession Queries and Handover, Branch Operations, Administration, Customer Support, Cover Note Control, Inspection, Billing, Customer Service, Filing & Dispatch, Quality Check, Discrepancy Resolution, MIS & Reports, Excel" },
  { firstName: "YOGENDRA", lastName: "SHUKLA", email: "ypshukla13@gmail.com", phone: "(+91) 9140163295", skills: "Python Programming, Java Programming, Javascript, Python, C++, MS Office, Business Development" },
  { firstName: "HARSH PRAKASH", lastName: "TIWARI", email: "harshprakashtiwari810@gmail.com", phone: "9326071854", skills: "MS Office, Tally, CRM tools & Softwares" },
  { firstName: "Roshan", lastName: "Sharma", email: "roshankumar01234@gmail.com", phone: "7488872114", skills: "B2B & B2C Sales, Lead Generation & Conversion, Client Relationship Management, Negotiation & Closing Deals, Market Research & Competitor Analysis, Technical Product Demonstration" },
  { firstName: "Deeksha", lastName: "Srivastava", email: "deekshasrivastava625@gmail.com", phone: "9453112742", skills: "Team Leadership, People Management, B2C Sales Strategy, B2B Sales Strategy, CRM Management, Analytics, Training, Development, Market Research, Program Research, Customer Success, Client Relationship Management, Strategic Planning, Execution, MS Office Suite, AI Tools" },
  { firstName: "Dibyendu", lastName: "Singharoy", email: "singharoydibyendu98@gmail.com", phone: "8116688795", skills: "Business Development, Lead Generation, Cross Functional, Key Account Management, Revenue Forecasting, B2C Sales, Market Research, Strategic Sales Planning, CRM Utilization - LeadSquared, Client Relationship Building" },
  { firstName: "Ajay", lastName: "Mane", email: "mane641995@gmail.com", phone: "8879531162", skills: "Microsoft Excel, PowerPoint, Word" },
  { firstName: "VIRAJ", lastName: "SATAM", email: "vsatam1110@gmail.com", phone: "9082401286", skills: "Tally, CRM, Industry-Specific Solutions, Relationship Management, Negotiation" },
  { firstName: "PASHWA", lastName: "PATEL", email: "pashwa9@gmail.com", phone: "+91 992-489-2427", skills: "Project Management, Business Analysis, Team Leadership, Quality Assurance, Product Management, Strategic Planning & Execution, Sales & Revenue Growth, Market Analysis & Research, Client Relationship Management, Lead Generation & Conversion, Negotiation & Closing Deals, Partnership Development, Cross-functional Team Collaboration, XML, HTML/CSS, MySQL, PostgreSQL, MS Office, PowerPoint, Excel" },
  { firstName: "RAHUL", lastName: "KUMAR", email: "rahul651826@gmail.com", phone: "+91-8582036844", skills: "Leadership, Team Management, Coaching and mentoring, Analytical, Strategic Thinking, Communications, Sales Forecasting and Pipeline Management, Negotiation, Closing, Data analysis and reporting" },
  { firstName: "BHAVESH", lastName: "VYAS", email: "Bhaveshvyas0015@gmail.com", phone: "+91 7424934707", skills: "CRM, Power Bi, Microsoft Office Suite, SaaS, software selling, business development, sales strategies, B2B relationships" },
  { firstName: "CHETAN", lastName: "MOHAKAR", email: "chetanmohakard@gmail.com", phone: "+91 9558585369", skills: "Client Acquisition, International Market Expansion, Cold Calling, RPF, Saas sales, AI driven approach, Salesforce, Freshworks, Lusha, Apollo, Clay, Hubspot, Calendly, Power BI, SQL, Excel, Agile, Cross-functional Collaboration, Business analysis" },
  { firstName: "Shaikh", lastName: "Aboozar", email: "aboozarshaikh2001@gmail.com", phone: "+91 9420377313", skills: "Leadership, Team management, HVAC, Research, IEC material development, Communication, Project management, Problem solving, CAD-CAM, Solid Works, AutoCAD, Energy-saving products, Technical Sales" },
  { firstName: "PRABHAT", lastName: "ANARSE", email: "prabhat.ana197@gmail.com", phone: "+91 86524 86272", skills: "Sales, Customer Handling, Business Process Analysis, Procurement, Supply Chain, Project Management, On-Site Inspections, Product Verification, Quality Assurance, Technical Documentation, Strategic Negotiations, ERP, Sales Process Engineering, Pre-Sales Support" },
  { firstName: "Vipul", lastName: "Baviskar", email: "vipulbav22@gmail.com", phone: "8693809625", skills: "Technical Product Knowledge, Customer Relationship Management (CRM), Solution Based Selling, Cross Functional Collaboration, Computer-Aided Manufacturing, SolidWorks modeling" },
  { firstName: "Anish", lastName: "Malgekar", email: "anishsmalgekar@gmail.com", phone: "+917045028063", skills: "Control Systems Design and Analysis, PLC Programming and Troubleshooting, P&ID Interpretation and Implementation, Internet of things(IOT)" },
  { firstName: "ZAFAR", lastName: "BAIG", email: "zafybaig1000@gmail.com", phone: "+91 7420983772", skills: "Sales Strategy Development, Lead Generation & Prospecting, Data Analysis & Reporting, Team Collaboration, Communication, Networking & Business Development, Adaptability & Flexibility, Negotiation & Closing Deals, Market Research & Competitor Analysis" },
  { firstName: "KUNAL", lastName: "SINKAR", email: "", phone: "9284770467", skills: "AutoCAD, NX" },
  { firstName: "Vivek", lastName: "Dwivedi", email: "vivek08dwivedi@gmail.com", phone: "+91 99812 03038", skills: "MS Excel, MS Word, AutoCAD, Gmail, Google Meet, Zoom, Adhesives, Abrasives, Grinding Wheels, Cutting Tools" },
  { firstName: "Amit", lastName: "JHAMB", email: "amitjhamb@outlook.com", phone: "9717771451", skills: "Business Development, GTM Strategy, Key Account Management, Consultative Selling, Sales Leadership, Revenue Growth, Strategic Partnerships, Alliances, Ed-Tech, K-12, Competitive Exam Solutions, Negotiation, Stakeholder Management, AI-powered Learning, Digital Learning Solutions, Curriculum Adoption, Professional Development, Tablet-based Learning Solutions" },
  { firstName: "ILMA", lastName: "HASHMI", email: "ilmahashmi17@gmail.com", phone: "8562978670", skills: "Account management, K12 Education, School Outreach, Business development, B2B, Corporate tie-ups, Advertising, Market research, Sales planning, Media planning, Client handling, Lead generation, Digital marketing, Branding and Communications, Social Media Marketing, Content Marketing, Public Relations, Marketing Analytics, Presentation skills, Advanced Excel, Planning & Organizing, Time Management, Personal & Interpersonal Effectiveness" },
  { firstName: "Mohit", lastName: "Rajput", email: "mohitraj7711@gmail.com", phone: "919445417076", skills: "Policy Advocacy, Government Liaison, Partnership Development, Management, Industry Engagement, NGO Collaboration, Stakeholder Relationship Management, Alliance Building, Negotiation, Memorandum of Understanding (MoU) Development, Business Development, Outreach, Lead Generation, Social Media Marketing, Presentation Skills, Networking, Opportunity Identification, Project Management, Execution, End-to-end Project Lifecycle, Cross-functional Teamwork, Stakeholder Coordination, Program Monitoring, Evaluation, Strategic Communication, Public Speaking, Report Writing, Active Listening, Relationship Building, Apprenticeship Program Development, Implementation, National Apprenticeship Promotion Scheme (NAPS), Apprenticeship Embedded Degree Program (AEDP), Apprenticeship Portal Management, Contract Generation, Skill Development, Entrepreneurship Initiatives, Government Schemes (SSDF, BoCW, PMKVY 4.0, PM Vishwakarma), Skill Gap Analysis, Entrepreneurship Program Design, Financial Literacy Programs, Data Analysis, Reporting, Market Analysis, Quantitative & Qualitative Research, Report Generation (leveraging SPSS), Performance Tracking" },
  { firstName: "CHINTHALA", lastName: "SRIKANTH", email: "chinthalasrikanth468@gmail.com", phone: "8121979369", skills: "SketchUp, Enscape, Lumion, V-Ray, AutoCAD, 3ds Max" },
  { firstName: "Sameer", lastName: "Faizan", email: "smrfzn@gmail.com", phone: "+91 79932 93101", skills: "AutoCAD, Google SketcUp, Vray, Enscape, Project Management" },
  { firstName: "Vaisishtya", lastName: "Ponnapalli", email: "pvaisishtya@gmail.com", phone: "9949690146", skills: "Inside Sales, Business Development, Team Management, Strategic Thinking, Customer Relationship Management, Revenue Growth, Performance Management, Sales Training" },
  { firstName: "Sashikanth", lastName: "Gurazada", email: "Sashikanth220@gmail.com", phone: "8008955966", skills: "Advanced Excel, Microsoft 365, MS PowerPoint, Salesforce, Zoho, MS Word" },
  { firstName: "S. SAI", lastName: "KRISHNA", email: "siricilla.saikrishna@yahoo.com", phone: "+91 7286995600", skills: "Key Account Management, New Business Development, Proposal Preperation, Lead Generation, Client Acquisition, Saas Sales, Account Development, Revenue Generation, Relationship Management, Eneterprise Account Management, Client relationship management, Requirement Analysis, Pitching Services, Proposal Development, Negotiation & Closure, Internal Collaboration, Market Intelligence, Revenue Growth" },
  { firstName: "AYESHA", lastName: "SAYEDA", email: "ayeshaa.sayedaa@gmail.com", phone: "74064 67044", skills: "Architect, Interior Designer" },
  { firstName: "ANKIT", lastName: "SINGH", email: "ankitrathore7862@gmail.com", phone: "+91 7858045346", skills: "ESG integration, climate action, inclusive development, sustainability integration, strategic planning, recruitment strategy, IGBC certification, green initiatives, CSR partnerships, sales & marketing, stakeholder management, revenue growth, business scaling, sustainability integration in business, cross-functional collaboration, user research, fundraising" },
  { firstName: "Suyoga", lastName: "Joshi", email: "suyoga.joshi@gmail.com", phone: "+91 8007485936", skills: "Team Leadership, Supervision, Managing, Mentoring, Motivating, Conflict Resolution, University Relations, Stakeholder Relations, Liaison with UK universities, B2B Communication, B2C Communication, Marketing, Events, Organizing fairs, Webinars, Outreach events, Digital engagement, Global Education Systems, Knowledge of Ireland admissions, Knowledge of UK admissions, Knowledge of Dubai admissions, Visa processes, Student Recruitment, Counseling, End-to-end counseling, Conversion strategies, UK education expertise, Operations, Administration, Branch management, Process optimization, Public Speaking, Cross-Cultural Skills, Seminars, Webinars, Multinational interaction" },
  { firstName: "AKANKSHA", lastName: "SINGH", email: "akanksha.singh2092@gmail.com", phone: "09799226142", skills: "Educational & Institutional Sales, Target Achievement & Lead Conversion, Client Relationship Management, Strategic Outreach & Communication, Team Leadership & Reporting, CRM & Documentation" },
  { firstName: "Dinesh", lastName: "Kale", email: "dineshkale125@gmail.com", phone: "+91-9834894089", skills: "Strategic Sales Planning, Business Development, B2B & B2C Sales, Key Account Management, Client Relationship Management (CRM), Market Penetration Strategies, Territory Management, Sales Forecasting & Analytics, Consultative Selling, Revenue Growth Strategies, Pipeline Development, Contract Negotiation, Partnership Development, Competitive Market Analysis, Customer Acquisition & Retention" },
  { firstName: "Ankit", lastName: "Singh", email: "sankit963@gmail.com", phone: "+91-9569844288", skills: "Strategic Sales Planning, Client Relationship Management, Presentation Skills, Team Leadership, Market Research and Analysis, Partnership Cultivation, Program Development and Implementation, Decision Making" },
  { firstName: "Nikhil", lastName: "Aggarwal", email: "nikhilbrother9@gmail.com", phone: "+91-8076840070", skills: "Cybersecurity sales, SaaS sales, Sales pitch, Lead qualification, Product Presentation, Proposal, POC, Negotiation, Closure, Sales to Enterprise accounts, Technical discussion, Preparing proposal, Lead generation, Cold calling, Email campaigns, Business origination, Sales Strategy, Salesforce, Admissions, Strategy, Marketing Automation tools, Pardot" },
  { firstName: "Kirti", lastName: "Rathor", email: "kirtirathor063@gmail.com", phone: "+91-9399070788", skills: "CRM Platforms (Salesforce, HubSpot, Zoho CRM, GFG CRM), Marketing Automation Tools (Mailchimp, Klaviyo, Marketo), SaaS Sales, International Sales, AI-Powered Sales Tools (Gong, Clari, Outreach.io), Analytics Tools (Google Analytics), Communication Tools (Slack, Zoom, Microsoft Teams), Lead Management Systems, Chatbots & Conversational AI, Payment Gateways Integration (Razorpay, Stripe, PayPal)" },
  { firstName: "SIDDHANT", lastName: "NIKALJE", email: "siddhantnikaje123@gmail.com", phone: "7400359118", skills: "Problem-solving skills, Cross-functional collaboration, Cross-selling techniques, Customer relationship management, Pipeline management" },
  { firstName: "Nidhi", lastName: "Panchal", email: "", phone: "9913920929", skills: "Business Partnership, ERP Solutions, Odoo ERP, Business Development, Partner Acquisition, Sales, Negotiation, Client Relationship Management, Recruitment, Team Leadership, Sales & Marketing Strategies" },
  { firstName: "ASHISH", lastName: "JAISWAR", email: "ashishrajnath444@gmail.com", phone: "+91 - 84249 40309", skills: "B2B Sales, Channel Partners working together, Marketing Management - Online Marketing, Social Media Marketing - Customer Service, Strategic Planning - Management, Microsoft Excel, Microsoft Office, Project Management, Digital Marketing, Digital Marketing Experience, E-commerce - Team Management, Leadership, Direct Sales - Team Motivation, Marketing Strategy, Microsoft Word Planning" },
  { firstName: "KESHA", lastName: "BORISA", email: "keshaborisa@gmail.com", phone: "7984681597", skills: "Account-Based Marketing (ABM), MQL, SQL, CRM, Salesforce, Zoho CRM, HubSpot, Apollo.io, Sales Navigator, Bamboobox.ai, Outreach, Mailchimp, Hunter.io, Lavender, ChatGPT, Twain, Humanlinker, Scalelist, Zoominfo, Chili Piper, Google Analytics, Google Business Profile, Meta, Power BI, Canva, Trello, Assana, Mircosoft Office, Google Workspace, WhatsApp Business, Sales & Marketing, Enterprise Lead Generation, Funnel Optimization, B2B Sales, B2C Sales, SaaS Sales, OEM Sales, International Business Development, Cold Calling, Email Campaigns, Sales Enablement, Pipeline Management, Client Demo, Deal Closure, Strategic Prospecting, Contract Negotiation, GTM Strategy, Campaign Management, Social Media Marketing, Local SEO, Website Optimization, Content & Brand Messaging, Personal Branding, Market Research, Digital Strategy, Buyer Persona Development, Value Proposition Design, Storytelling, Copywriting, Content Strategy, Cross-Functional Collaboration, Team Training, Mentorship, Project Coordination, Tools Automation, Client Relationship Management, Strategic Communication, Reporting, Analytics, Intent-Based Outreach" },
  { firstName: "Naman", lastName: "hirpara", email: "namanhirpara04@gmail.com", phone: "(+91) 8169649739", skills: "SaaS Sales, Demonstration, Sales Presentations, Marketing, Lead Generation, Excel, PowerPoint, Word, Cold Calling, Prospecting, Negotiation, Presales, Post Sales, Onboarding, Sales Training" },
  { firstName: "Mohit", lastName: "Bajaj", email: "mohitbajaj780@gmail.com", phone: "8999044505", skills: "Product Knowledge, Communication, Management, Negotiation" },
  { firstName: "ANKIT", lastName: "KUMAR", email: "ak03122000@gmail.com", phone: "(+91) 8507833500", skills: "International Sales, Industrial Automation Sales, Business Development, Key Account Management, Automation Sales, Scada Sales, Application Engineering, PLC programming, ladder logics, BD, STL, Scada, DCS" },
  { firstName: "Apurva", lastName: "Karmase", email: "apurvkarmase2000@gmail.com", phone: "91-9137399151", skills: "Key Account Management, Consultative Selling techniques, Client Retention Strategies, Negotiation and Contract Management, B2B Sales Strategy, Lead Generation & Prospecting, Stakeholder Engagement, Problem Solving & Conflict Resolution, Autodesk SaaS Product Knowledge, CRM Tools (Zoho, Hubspot, Salesforce), Market Analysis and Competitor Research, Cross-selling & Up-selling Strategies, Sales Pipeline & Funnel Management, Software solutions, Sales Forecasting, ROI Analysis and cost Benefits study, Project Planning & Execution, Business Plan Presentation skills, Product Demonstrations, Event Planning & Execution, Cross Functional Team Collaboration, Relationship Building and Networking, Photo & Video Editing for marketing campaigns, Time management & Multi-Tasking, Documentation & Reporting, Innovation in Sales campaigns" },
  { firstName: "Dhrumil", lastName: "Dongre", email: "dhrumildongre@gmail.com", phone: "+91 7046583530", skills: "B2B Lead Generation, LinkedIn Sales Navigator, Outreach Automation, Cold Emailing, Cold Calling, Proposal Drafting, RFP Response, CRM Management, Upwork Bidding, Freelancer Client Handling, IT Solutions, Market Research, Data Mining, HubSpot, Zoho CRM, Apollo.io, MS Excel, Word, PowerPoint, Gmail, Outlook, Zoom, Teams" },
  { firstName: "RAHUL", lastName: "KUMAWAT", email: "sdmumbai415@gmail.com", phone: "8107191672", skills: "Product Knowledge, Client Needs Assessment, Lead Generation, Demo & Presentation Skills, Solution Selling, Negotiation & Closing, Industry Knowledge, Post-Sales Coordination, Communication & Relationship Building" },
  { firstName: "HIMANSHU", lastName: "PRAJAPATI", email: "himanshurp1604@gmail.com", phone: "+91 8733810173", skills: "SAP B1/Add-on, SaaS Sales, ERP, IT Sales, Client Relations" },
  { firstName: "Amol", lastName: "Pawar", email: "amol27061998@gmail.com", phone: "8850984366", skills: "Sales, Business Development, Client Relationship Management, CRM, Lead Generation, Account Management, Trading Account Opening, Customer Support" },
  { firstName: "Aayushi", lastName: "Kothari", email: "kaayushi38@gmail.com", phone: "+91 8104228817", skills: "Enterprise Sales, B2B Selling, Account Management, Cloud Solutions, Client Acquisition, Client Retention, SaaS, PaaS, IaaS, FinTech, Payments, Application Modernization, Infrastructure, Security, Robotic Process Automation, Artificial Intelligence, Machine Learning, Intelligent Document Processing, Low-Code/No-Code platforms, Chatbots, Financial Solutions, Data & Analytics, Customer Experience, Business Intelligence, Co-Pilot tools, AWS, Microsoft, Salesforce, HubSpot CRM" },
  { firstName: "Aman", lastName: "Hussain", email: "amaangundguri487@gmail.com", phone: "7996999931", skills: "AutoCad 2d &3d, Revit, Sketchup" },
  { firstName: "", lastName: "", email: "", phone: "", skills: "AutoCAD, SketchUp, EnScape, PPT, MS Word, MS Excel" },
  { firstName: "Abhay", lastName: "belamagi", email: "abhaybelamagi1713@gmail.com", phone: "+91 8546866789", skills: "Auto CAD 2D, MS Office, Revit, Sketchup" },
  { firstName: "Akhilesh", lastName: "S", email: "akhileshakhil631@gmail.com", phone: "9741102948", skills: "Auto cad, Sketch up, Vray, Civil Construction, Construction, Civil Project, Project Planning, Interior Designing, Project Coordination" },
  { firstName: "AJAY", lastName: "KUMAR KU", email: "kuajaykumar2002@gmail.com", phone: "8688935309", skills: "AutoCAD, SQL, Python, Salesforce Admin, Salesforce Developer" },
  { firstName: "Shivaleela", lastName: "Sahukar", email: "sahukarshivaleela310@gmail.com", phone: "9164686656", skills: "AUTOCAD, REVIT, QUANTITY SURVEY (Estimation), LUMION, SKETCH UP" },
  { firstName: "V", lastName: "SHASHANK", email: "shashank16301@gmail.com", phone: "9353515136", skills: "AutoCAD, SketchUp, Revit, Adobe Photoshop, Adobe Premier Pro, Stadd.pro" },
  { firstName: "B.", lastName: "Seshu Babu", email: "sheshusheshu21@gmail.com", phone: "+91- 8217899607", skills: "3ds max, Auto Cad, Sketch up, Corona for 3ds max, Microsoft Office, V- Ray for sketch up & max, Interior Designing, Enscape, Photoshop" },
  { firstName: "Santoshi", lastName: "Nase", email: "santoshibnase09@gmail.com", phone: "9353749511", skills: "Autocad, Revit" },
  { firstName: "SANDEEP", lastName: "JAJEE", email: "sandeepjajee111@gmail.com", phone: "91+7411562212", skills: "AUTO CADD, STAAD PRO, Coraldraw, Autodesk 3DMAX, canva, Chaos V-Ray, Adobe Photoshop" },
  { firstName: "Syed Sabir", lastName: "Piya", email: "syedali98868@gmail.com", phone: "+ 91-9740688847", skills: "Market Analysis, Sales, Management, Lead Generation, Development, Analytics, Negotiation" },
  { firstName: "Reshma", lastName: "Padhy", email: "mamareshma@gmail.com", phone: "8280069606", skills: "AutoCAD, MSOffice (Excel, PPT, Word), Trimble Sketch up, Revit" },
  { firstName: "Renushree", lastName: "G R", email: "renushree321@gmail.com", phone: "+917795517549", skills: "AutoCAD, SketchUp, Revitt, 3ds Max, Lumion, V-Ray" }
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


