const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Candidate = require('./models/Candidate');
const Skill = require('./models/Skill');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ats';

const candidatesData = [
  { firstName: "Yashoda", lastName: "Lamani", email: "yashucl26@gmail.com", phone: "+91-7338338043", skills: "AutoCAD 2D Drafting, SketchUp with V-Ray, GIS Analysis & Spatial Data Management, QGIS (Layout, Attributes, Map Superimposition), Database Compilation & Graphic Representation, Map Creation & Geospatial Data Collection, Basic QGIS Layout & Working with Attributes, Importing TSV Files into QGIS" },
  { firstName: "Rakshitha", lastName: "BR", email: "rakshithabr21@gmail.com", phone: "7259614489", skills: "AutoCAD, Sketchup, Advanced Excel, MS Word, Revit" },
  { firstName: "PUNITHAN", lastName: "P", email: "punithankishore2316@gmail.com", phone: "+91 9360362643", skills: "AutoCAD, Revit, BIM, Sketch Up, STAAD Pro" },
  { firstName: "SOWMIYAVATHI", lastName: "V", email: "vsowmiyavathi@gmail.com", phone: "+919159774912", skills: "AutoCAD, Sketch up, V-Ray, Tekla, 3ds Max, RAPT" },
  { firstName: "Ayushi", lastName: "Chowdhury", email: "ayushio9o7chowdhury@gmail.com", phone: "8388892863", skills: "Space planning, Interior Elevations, 3d model, rendering, Autocad, Sketchup, Enscape, V- Ray" },
  { firstName: "Muhammed", lastName: "Shijas", email: "inzamam.ok@gmail.com", phone: "6282366676", skills: "3D Modeling, 3D Visualizing, Sketchup Modeling, D5 Rendering, Lumion Rendering, AutoCad Droughting, Concept Designing, Interior Designing, Drafting Furniture and Plan Layout" },
  { firstName: "Debmalya", lastName: "Basu", email: "debmalyabasu612@gmail.com", phone: "6297043383", skills: "Auto CAD 3D, MS Office, MS Word, MS Excel, MS Power Point, Photography" },
  { firstName: "KALYAN", lastName: "A", email: "kalyanambekar12343@gmail.com", phone: "+91-9632312343", skills: "AutoCAAD, Google SketchUP, Rendering tools like VRAY & Lumion, Microsoft office" },
  { firstName: "Rama Krishna Surya", lastName: "Vamsi", email: "krksvamsi01@gmail.com", phone: "08919911435", skills: "Auto-CAD, SketchUp, Revit, STAAD PRO, MS-OFFICE, HYPERMESH, LS DYNA" },
  { firstName: "PAVITRA", lastName: "KONDAVEETI", email: "kondaveetipavitra@gmail.com", phone: "6302344525", skills: "AutoCAD, Sketchup, 2D Floor plan design, Ms Word, Excel" },
  { firstName: "HIMANI", lastName: "NATALI", email: "himaninatali163@gmail.com", phone: "+91 8780809222", skills: "AutoCAD, Revit, Sketchup, Ms Office Excel, Word, Power point, Architectural detailing, Daily progress report, Bar Bending schedule, Collaborative Workflow" },
  { firstName: "MURALA", lastName: "RAJU", email: "muralaraju2015@gmail.com", phone: "9542430926", skills: "AutoCAD, Revit, SketchUp, V-Ray, Lumion, Enscape, CAD software, 3D modelling, visualization software" },
  { firstName: "", lastName: "", email: "kanchumojumani14@gmail.com", phone: "(+91) 8897032640", skills: "Architectural Design, Site Supervision, Flooring, Carpentry, 3D, 2D, Wood, Rendering, Modular Kitchen, Furniture, Interior Decoration, Interior Designing, AutoCAD 3D, AutoCAD 2D, VRAY, Sketchup, AutoCAD" },
  { firstName: "Arindam", lastName: "Mitra", email: "arindammitra2012@gmail.com", phone: "+91 9831100739", skills: "SQL Server, Oracle, Data Warehousing, Data Modeling, ETL, SSIS, SSAS, MDX, Azure Data Factory, Databricks, Power BI, SSRS, NOSQL – Mongo DB, Python" },
  { firstName: "Sunil", lastName: "Herbert", email: "sunil.herb@gmail.com", phone: "+91-9884778499", skills: "Oracle, PL/SQL, PostgreSQL, MySQL, Performance Tuning, DBA activities, TOAD, SQL Developer, PLSQL Developer, Datapump, Snowflake DB, Version control tools using GitHub, Bitbucket, SVN, JIRA, UNIX, HPQC, Visual Basic, Crystal Reports, RMAN, SQL*Loader, Import and Export utilities, Active Data Guard, Ora2Pg tool" },
  { firstName: "JAGADEESH", lastName: "JUDAGIRI", email: "jagadeesh.cme@gmail.com", phone: "+91 8088107104", skills: "Enterprise Architecture, Cloud Migration, Data Modelling, Solution Design, Application Modernization, Technical Leadership, Integration Strategy, Data Governance, DevOps Enablement, Platform Engineering, Stakeholder Management, Team Building & Leadership, C, C++, C#, ASP.Net, ADO.Net, Web application, MVC, SSRS, SSIS, SSAS, ADF, ASPX Creation, XML, WEB Service, SQL Reports, HTML, Telerik, Controls, Sitefinity (CMS), CSS, Java Script, JQuery, MS-SQL Server 2008 / 2014 / 2017 / 2019, Microsoft SQL Azure (RTM), Managed Instance, Microsoft Visual Studio 2008/2010/2015/2017, Visual Source Safe (VSS), Subversion Controls (SVN), GIT, Team Foundation Server (TFS), VMware Nutanix, Cisco, Azure VM server management, SQL Server & Power BI on-premises installation, license management" },
  { firstName: "Noopur", lastName: "Gupta", email: "noopurgupta44@gmail.com", phone: "+91-9686684129", skills: "Python, SQL, Scala, R, Shell, Big Data, Hadoop, Spark, Snowflake, Kafka, Hive, Impala, Kudu, Oozie, Azure Data Factory, Synapse, Databricks Notebooks, Logic App, Power App, AWS PaaS, Relational Databases, HBase, MongoDB, Cassandra, Redis" },
  { firstName: "RaviTeja", lastName: "", email: "Ravitejaprasanth@gmail.com", phone: "+91- 9966218825", skills: "Data Modeling, Data Mart Development, Data Warehousing, SQL Server 2012, MSBI, ETL, SSIS, SSRS, SSAS, Power BI, Azure, Tables, Stored procedures, Functions, Triggers, Constraints, Indexes, Schemas, Views, T-SQL, Query Optimization, Performance tuning, SSIS Packages, Control Flow, Transformations, Logging, Error handling, SQL Server Agent, Check points, Drill down reports, Drill through reports, Parameterized reports, Linked reports, Sub reports, Report builder, Report snapshot, Report cache, Matrix reports, Tabular reports, Dimension, Facts, Attributes, Measures, Fact Tables, Dimension Tables, Star schema, Snowflake schema, Power BI reports, Dashboards, Data visualizations, Power Query, Power BI Service, DAX Functions, Power BI Filters, Power BI Gateways, Row level Security, New Measure, New column, Q&A, Logical Data Modeling, Physical Data Modeling, Conceptual Data Modeling, Cubes, MDX, SQL Server Management Studio, Business Intelligence Development Studio, SSIS, SSAS, SSRS, POWER BI, Azure Data Factory, ADF pipelines, Azure environment, PaaS, IaaS, Hybrid model" },
  { firstName: "FAISALMIYA", lastName: "SHEKH", email: "faisalshekh073@gmail.com", phone: "(+91) 7698393013", skills: "SQL, GCP, BigQuery, Performance Optimization, PL/SQL, Unix scripting, Cloud SQL, Compute Engine, Cloud Storage, ETL pipelines, database optimization, Bitbucket, Jenkins, Oracle SQL, PostgreSQL, MSSQL, Shell Scripting, PowerShell, SQL Developer, SQL Server 2016, GIT, Control-M" },
  { firstName: "Murali", lastName: "", email: "telltomuralim@gmail.com", phone: "9865579454", skills: "Java, Spring Boot, Hibernate, Maven, RESTful Services, SOAP Web Services, Kafka, Postman, JSON/XML, jms, MySQL, MongoDB, Docker, Kubernetes, OpenShift, Jenkins, Git, Grafana, ElasticSearch, IntelliJ IDEA, Eclipse, Visual Studio, JIRA, Microservices, Event-Driven Architecture, Design Patterns, Object-Oriented Design, SOLID Principles, AWS" },
  { firstName: "DIPIL MOHANDAS", lastName: "PILLAI", email: "dipil197@gmail.com", phone: "+91 9987572368", skills: "AWS, Azure, Neo4j, Cosmos DB, Azure Cloud SQL Servers, Azure Data Factory, Azure Databricks, PySpark, CI/CD pipelines, Azure DevOps, Git, Professional Scrum Master, SQL, Python, PowerShell, SQL Server Administration, MongoDB, Mongo DB Atlas, Studio3T, Windows Operating System, Linux Operating System, Delta Lake, Medallion Architecture, PCI Compliance, Enterprise Recon tool, Jira, Confluence, ServiceNow, SSIS, RDS, EC2, SQL Server Profiler, DTS, Replication, SSIS" },
  { firstName: "GOURAV", lastName: "TEWATIA", email: "gourav.tewatia@pm.me", phone: "(+91) 99584 01466", skills: "Rust-lang, HTML5, PHP, Laravel, CSS3, Python, JavaScript, jQuery, Vue.js, .NET, C#, AJAX, C/C++, RESTful APIs, Linux Administration, Splunk, Datadog, Prometheus, MySQL, MariaDB, MongoDB, NoSQL, Mail Exchange Server Configuration, nginx Server Configuration, Git, GitFlow, Docker, AWS, Google Kubernetes Engine, Object-oriented Programming, Jenkins, Bash, Data Structures, React, Typescript, CMD, PowerShell, Node.js, ETL, Data Pipelines, Apache Kafka, RabbitMQ, Kinesis, Redis Streams" },
  { firstName: "Sushanta", lastName: "Saha", email: "ssaha001002@gmail.com", phone: "+91 - 9619451253", skills: "HubSpot, Microsoft Dynamics 365, Sales Force, Microsoft Azure, GCP, AWS, Hadoop streaming, Spark, SQL, R, Python, Apache Spark, Cognos Bl, Tableau, Click Sense, Power Bl, Google Analytics, Adobe Analytics, Business Analytics, Financial Analytics, IBM lnfosphere Big Insight, Machine Learning, Deep Learning, IBM SPSS Modeller, NLP, Tableau 9.4, Python - Matplotlib, Advanced Digital Marketing, DV360, RTB, DSP, SSP, DMP" },
  { firstName: "TEJASWINI", lastName: "JAMPANA", email: "tejaswini4310@gmail.com", phone: "9177884310", skills: "PowerShell, Python, Bash, Ruby, AWS, Google Cloud Platform, Azure, VMware, Hyper-V, KVM, SAN, NAS, DAS, RAID, VLAN, Firewalls, Load Balancers, TCP/IP, DNS, DHCP, IAM, SSL Certificates, Patch Management, Vulnerability Assessments, ServiceNow, Change Management, Incident Management, Ansible, Terraform, Jenkins, Wireshark, Nagios" },
  { firstName: "Megharaj", lastName: "Dadhich", email: "megharaj.d@intelora.co.in", phone: "9967868209", skills: "Java, J2EE, SpringBoot, Python, Node, Java Message Service, Kafka, Liferay, Informatica ETL, PHP, JQuery/JavaScript, PixiJS, MicroService Architect, Pre-Sales Architect, Solution Architect, Software Architect, Infrastructure Architect, Domain Driven Architecture (DDD), Amazon Web Services, Azure, OpenShift, Cloud Architect, Cloud Computing, Cloud Infrastructure, DevOps-Jenkin, DevOps -Kubernetes, NoSql, MySQL, Docker, Linux, Unix, Algorithms, Architectural Patterns, API Gateway, API Management, Systems Integration, Code Review, Data Modeling, Design Review, E-Commerce, Express.js, Scrum Planning, Agile Development, Service Review, Web Development, Test Driven Development (TDD)" },
  { firstName: "Murali", lastName: "Sivala", email: "sivalamurali33@gmail.com", phone: "+91-9704731023", skills: "SQL Server, Oracle, Data Warehouse, SQL Server Integration Services (SSIS), SQL Server Analysis Services (SSAS), SQL Server Reporting Services (SSRS), Power BI, SQL Server Management Studio (SSMS), SQL Server Agent, pgAdmin 4, T-SQL, MDX, DAX, Microsoft Business Intelligence (MSBI), Linked Servers, ETL Logging, Scheduler Automation, Role-level Security, Row-level Security, Cube Deployment, Data Migration, Performance Tuning" },
  { firstName: "Kallpna", lastName: "Siirsodia", email: "kalpanasisodia@gmail.com", phone: "+91-9810355127", skills: "Data Modeling, Schema Design, OLTP, OLAP, Adobe Experience Platform, Azure Data Factory, SSIS, ETL Pipelines, Azure Synapse, Azure SQL DB, SQL, T-SQL, PL/SQL, C#, Data Ingestion, ASP.NET, Erwin, ER Studio, Azure, Power BI, Git, Bitbucket, TFS, Jira" },
  { firstName: "Manoj", lastName: "Bhole", email: "manojabhole@gmail.com", phone: "09224288691", skills: "SQL, Snowflake, Azure Data Factory, Azure Databricks, Python, Power BI, Data Governance, Compliance, Security, ETL, SSIS, SSRS, iReports, PySpark, SparkSQL, T-SQL, Stored Procedures, GitHub, Azure DevOps, JIRA, Visio, ERWin, Agile, Scrum, SAFe, CI/CD pipelines" },
  { firstName: "Ashok", lastName: "Mandaliya", email: "ashok_jobs@outlook.com", phone: "7567639394", skills: "Data platforms, Data warehouse, Databricks, Snowflake, Teradata, Oracle, ETL, Ab Initio, Informatica, BI, Reporting, Power BI, Tableau, SSRS, SAP BO, Cognos, Grafana, Kibana, Cloud, Azure, AWS" },
  { firstName: "ANKIT", lastName: "GOSWAMI", email: "goswamiankit07@gmail.com", phone: "+91 8169866369", skills: "Key Account Management, Customer Relationship Mgmt., Market & Competitive Analysis, Sales Strategy Development, Project Management, Business Development, Stakeholder Management, Leadership & Team Management, Cross-functional Coordination, Salesforce, Flexisales, Jira" },
  { firstName: "GUDDU", lastName: "KUMAR", email: "chauhanguddu0@gmail.com", phone: "7277455124", skills: "C, SQL, HTML, CSS, Word, Excel, PowerPoint, Outlook" },
  { firstName: "Rakesh", lastName: "Ranjan", email: "ranjrak007@gmail.com", phone: "+91-8904199435", skills: "Java, Spring Boot, Microservices, REST, SOAP, JMS, ActionScript, Spring MVC, Spring Data JPA, Spring Batch, Hibernate, Cairngorm, AWS EC2, AWS S3, AWS ECS, AWS Lambda, AWS SQS, AWS AppConfig, Docker, Kubernetes, Kafka, Jenkins, GitHub Actions, PostgreSQL, MongoDB, Oracle, Cassandra, SQL Server, Jasypt, OAuth2.0, Voltage, TLS/SSL, Google Workspace SSO, IntelliJ, Eclipse, JIRA, Maven, Gradle, Postman, SOAP UI, SonarQube, Fortify" },
  { firstName: "Mukesh", lastName: "Pandey", email: "mukesh.ds.pandey@gmail.com", phone: "+919866455299", skills: "Data Architecture, Data Modeling, Microsoft Azure, ETL, ELT, Azure Databricks, Azure Data Factory, Azure Data Lake Storage, Microsoft Fabric, Snowflake, Erwin Data Modeler, Microsoft Visio, DBDiagram.io, Informatica IDMC, SSIS, Microsoft Purview, Unity Catalog, Azure Active Directory, Azure Role-Based Access Control, Azure Key Vault, Azure Monitor, Azure Log Analytics, SQL, MS SQL Server, MySQL, Oracle, PostgreSQL, Power BI, MicroStrategy, Denodo, Jira, GitHub, Azure DevOps, ServiceNow" },
  { firstName: "BIJENDRA", lastName: "BHARTI", email: "bijendra_bharti@yahoo.com", phone: "+91 7406072018", skills: "SQL, PostgreSQL, SSIS, Advanced Excel, Excel VBA, Teradata, RPA, SAS, R, Microsoft SQL Server Database, Oracle 9i, Tableau, Salesforce (Lightning), JIRA" },
  { firstName: "PARITOSH", lastName: "MANAS", email: "paritoshmanas20@gmail.com", phone: "+91-8800245162", skills: "Enterprise Data Architecture, Data Integration, Data Modeling, Data Warehouse, Database Architecture, Database Engineering, Azure cloud Technology, Data Architecture design, Performance Tuning, Data Integration, CI/CD, Orchestration, MSSQL, PostgreSQL, MySQL, MongoDB, ETL, Data Modelling, Datawarehouse, Azure Databricks, Azure Data Lakes, Azure Data Factory, SSIS, Delta Live Stream, Data integrity, security compliance, Database Design, Performance Monitoring, Backup and Recovery, Disaster Recovery, High Availability solutions, Automation and Scripting, Python, Panda, PySpark, Scala, PowerShell, Power BI, Apache Spark, Microsoft Synapse Analytics, Data Visualization, Azure, Cloud Security, Kubernetes, Docker, Deep Learning, NumPy, NLP, AI Framework, Time Series Analysis, Data Preprocessing, Feature Engineering, Big Data Processing" },
  { firstName: "SAMARINDER", lastName: "BASRAI", email: "samarinder.basrai@gmail.com", phone: "9999036540", skills: "Business Intelligence, Data Warehousing, Data Modeling, Cloud (AWS), Data migration, Solution designing, Delivery, Development, Maintenance Support, ETL methodology, Informatica Power Center, Talend, MicroStrategy, MS Power BI, Tableau, QlikSense, QlikView, Looker, AWS QuickSight, Matillion, Python scripting, Athena, Redshift, AWS EC2, Data Pipeline, Glue Crawlers, RedShift Spectrum, Step Functions, Lambda, Database modeling, Schema objects, Star and Snowflake schema, MicroStrategy Administration, MicroStrategy Developer, MicroStrategy Intelligent Cubes, MicroStrategy Transactional Services, Software Development Life Cycle, ITIL concepts, Linux, Unix shell scripting, SQL, PL/SQL, Oracle, Postgres, MSSQL Server, DB2, Teradata, Apache Cassandra, Control M, JIRA, Confluence, ServiceNow, Aginity, SQL Workbench, PgAdmin, Toad, Erwin, DrawIO, Zeppelin, Splunk, Kafka, Visual Source Safe, Telelogics CM Synergy, Telelogics Change Synergy, Gitlab, Github, BitBucket" },
  { firstName: "MAHIMA", lastName: "JENA", email: "mahimaprasad22@gmail.com", phone: "+91 7008599535", skills: "Erwin, Informatica, Oracle, Teradata, Cognos, Tableau, Shell scripting, Python, R, Machine Learning, Predictive analytics, Scrum/Agile methodology, Excel power Pivot, Power Bi, Spark, C, SQL, SSIS" },
  { firstName: "Yogesh", lastName: "Batham", email: "vivek45batham@gmail.com", phone: "09617446444", skills: "Product Demonstrations, Sales Analytics, Social Selling, Sales Forecasting, Proficiency in ERP, Email Marketing, Market Research, Knowledge of APIs and integration, Prospecting, Qualifying leads, Closing deals, Communication & Negotiation skills, Relationship Building, Sales Presentation skills, Adaptability & Teamwork" },
  { firstName: "YASH", lastName: "PATIL", email: "yashpatil.pune@gmail.com", phone: "+91-8983606963", skills: "B2B Sales, Account Management, Marketing, Sales Pipeline Management, Business Development, Client Retention, CRM Platform, Market Research & Analysis, Industry Research, Negotiation Skills, Solution Selling, Customized Quotation, Sales Presentations, Marketing Strategy, Project Management, Post-Sales Support, Aftermarket Sales, Relationship Management, Industry 4.0 - IoT, CMMS, MES, Automation Solutions" },
  { firstName: "Huzaif", lastName: "Qureshi", email: "qureshihuzaif16@gmail.com", phone: "+91-9702811007", skills: "Sales, Strategic Account Management, Digital Sales, Ad Sales, Business Development, Subscription sales, Account management, Solution selling, Franchise sale, Business proposals, Competitor analysis, Sales & operations monitoring, SaaS Sales, People Management, Relationship building, Negotiation, Digital Media Sales, End to End Sales" },
  { firstName: "KRISHNENDU", lastName: "DHARA", email: "krishnendudhara@rocketmail.com", phone: "(+91) 9044460376", skills: "Marketing Communication, Brand Management, Channel Sales, Corporate Sales, Direct Sales, Convincing Power, Inside Sales, Cold Calling, Lead Generation, Channel Partners, SAP Integration, Software Sales, B2B Sales, ERP integration" },
  { firstName: "Rakhi", lastName: "Jaiswal", email: "rakhijaiswal7108@gmail.com", phone: "+918140432900", skills: "Lead Generation, Lead Qualification, Data Research, Market Research, Competitor Analysis, Saas Sales, Prospecting Skills, Hubspot, Zoho CRM, Lusha, Apollo, Contact out" },
  { firstName: "Divya", lastName: "Regula", email: "Divyaregula9@gmail.com", phone: "7702165274", skills: "Space Planning, Design Concept Development, AutoCAD, SketchUp, Photoshop, 3D Visualization, Rendering, Client Relationship Management, Budgeting, Cost Estimation, Project Management, Building Codes, Regulations, Sustainable Design" },
  { firstName: "RAMU", lastName: "DONTHULA", email: "ramu.donthula@hotmail.com", phone: "+91 9494556593", skills: "AutoCAD, SketchUp, 3ds Max, V-Ray, MS Office, Space Planning, 3D Modeling, Drafting, Vendor Management, Site Supervision, Quantity Estimation, Client Communication" },
  { firstName: "YASHWANTH", lastName: "GUNDLAPALLY", email: "gundlapallyyashwanth1998@gmail.com", phone: "+ 91 9398806926", skills: "AutoCAD, 3ds-Max, Sketchup, Pytha, coohom, Sketching, Design Thinking, Creativity, Problem solving" },
  { firstName: "Gogulaedu", lastName: "Kondalu", email: "gogulakonda281@gmail.com", phone: "+916301085547", skills: "AutoCAD, SketchUp, Adobe Creative Suite, Photoshop, Illustrator, 3D Modelling, V-Ray, Enscape, Lumion, Space Planning, Material Selection, Concept Development, Time Management, Creative Thinking" },
  { firstName: "KAJAL", lastName: "SINGH", email: "kajalsingh27061998@gmail.com", phone: "9175437557", skills: "SketchUp, Canvas, Enscape renders, Interior Design, Space planning, AutoCAD" },
  { firstName: "JAVVAJI", lastName: "PRAVEEN", email: "praveenjawaji@gmail.com", phone: "+91 8978336810", skills: "Autocad, Sketchup, Vray, Enscape, Ms office" },
  { firstName: "NEHA", lastName: "KONDA", email: "neha27konda@gmail.com", phone: "+91 7702539127", skills: "AutoCAD, Sketch Up, V-Ray, Enscape" },
  { firstName: "ASIT", lastName: "DASH", email: "asitdash1212@gmail.com", phone: "+91 7042614811", skills: "ISA 95 Integration Architecture, Business Application Architecture, Manufacturing Execution Systems (MES), Enterprise Resource Planning (ERP) Integration, OT/IT Convergence, Industrial IoT, Cloud-Native Architecture (AWS/Azure/GCP), Data Warehouse, Big Data Architecture, Digital Transformation, DevOps, Golang, Kubernetes, Edge Analytics, SCADA Integration, Azure IoT, Digital Twin, Prometheus, Enterprise Service Bus, API Gateway, Microservices, Event Streaming, Redis, IoT Sensors, Edge Computing, Data Analytics, Predictive Maintenance, SAP ERP, WMS, TMS, BI Platform, Data Lake, MLOps, Big Data Analytics, Cloud Migration, ETL (Informatica), OBIEE, Hadoop, MDM, Cloud Architecture, Business Process Automation, SQL Server" },
  { firstName: "Shareef", lastName: "Sheikh", email: "shareef0710@gmail.com", phone: "917089002086", skills: ".NET Core, C#.Net, VB.Net, Java script, Python, Scala, Spark SQL, Web API, Power BI, Microsoft SSIS, SSRS, Microsoft Azure, Google Cloud Platform, Azure/Cloud function, Active Directory, Web APP, Cloud Engine, Spark, Kafka, Nifi, Cloudera, AWS Glue, Data Fusion, Microsoft Fabric, Purview, Dataplex catalog, AWS Glue Data Catalog, Azure big data pipeline, Data Lake, ADF, Data Governance, HDFS, DBFS, HDInsight, Google Data Studio, TensorFlow, Cognitive Search, Big Query, Amazon Redshift, Snowflake, Azure Synapse, SQL Server 2008, SQL Server 2012, Oracle 9i, Oracle 11g, MongoDB, Cosmos DB, Cassandra, Microsoft Visio, UML, Design pattern, ERWIN, ER Studio, OvalEdge, Collibra, Alation" }
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


