# 🚀 PerformEdge  
### 360° Performance Review and OKR Tracking System

PerformEdge is a cloud-based performance management system built using AWS serverless architecture.  
It enables organizations to conduct structured 360° reviews, track OKRs, and generate performance reports with automated workflows and role-based access control.

---

## 🌐 Live Deployment

🔗 http://performedge-host-bucket.s3-website.ap-south-1.amazonaws.com/

---

## 📸 Frontend Screenshots

### 🔹 Create Review Cycle
<img width="2880" height="1699" alt="Screenshot (2397)" src="https://github.com/user-attachments/assets/ecfeafe1-e7d8-4a10-b990-c4e274a04cec" />


### 🔹 Review Submission
<img width="2880" height="1699" alt="Screenshot (2398)" src="https://github.com/user-attachments/assets/3c7146e4-3132-4ce6-ba4f-44e75276ce69" />


### 🔹 Update OKR
<img width="2880" height="1731" alt="Screenshot (2399)" src="https://github.com/user-attachments/assets/198cfeda-e10c-41d6-8f3c-25fb10516b23" />


### 🔹 Report Generation
<img width="2880" height="1731" alt="Screenshot (2400)" src="https://github.com/user-attachments/assets/b9017c96-ff58-43b3-8733-43e9d0b9fd41" />


### 🔹 HR Dashboard
<img width="2880" height="1705" alt="Screenshot (2401)" src="https://github.com/user-attachments/assets/936f6f80-112d-4539-a908-0db256404ef0" />



---

## 🧰 Services Used

- **Amazon S3** – Frontend hosting & report storage  
- **AWS Lambda** – Backend business logic  
- **API Gateway** – REST API management  
- **DynamoDB** – NoSQL database  
- **Amazon Cognito** – Authentication & JWT handling  
- **Amazon SES** – Email notifications  
- **EventBridge** – Scheduled triggers  
- **Step Functions** – Workflow orchestration  
- **IAM** – Role-based access control  

---

## 🏗️ Architecture Overview

The system follows a fully serverless architecture:

1. User interacts with frontend hosted on S3  
2. Authentication handled via Cognito (JWT-based)  
3. API Gateway routes requests to Lambda  
4. Lambda executes business logic  
5. Data stored/retrieved from DynamoDB  
6. Reports generated and stored in S3  
7. EventBridge + Step Functions trigger reminders via SES  

---

## 🔄 Workflow Architecture

- User signs up → Cognito triggers user creation Lambda  
- Employee ID generated using counters table  
- User logs in → JWT token issued  
- Frontend communicates with API Gateway  
- Lambda processes requests (reviews, OKRs, reports)  
- Reports stored in S3 and accessed via URL  
- EventBridge triggers reminder workflows  
- Step Functions orchestrate email notifications  

---

## 🔐 Security

- JWT-based authentication via Cognito  
- Role-based access control (Employee / Manager / HR)  
- IAM policies for secure service interaction  
- Peer review anonymisation using hashing  

---

## 📊 Key Features

- ✅ 360° Feedback System (Self, Peer, Manager, Upward)  
- ✅ OKR Tracking with Progress Monitoring  
- ✅ Automated Report Generation (HTML + PDF)  
- ✅ HR Analytics Dashboard  
- ✅ Role-Based Access Control  
- ✅ Automated Email Reminders  
- ✅ Fully Serverless Architecture  

---

## 🧠 Anonymisation Logic

Peer review identity is protected by:
- Storing reviewer_id in hashed format (SHA-256)  
- Displaying only responses in reports  
- Preventing identity exposure to employees  

This ensures unbiased and confidential feedback.

---

## 🗂️ Database Tables

- **employees** – user data and roles  
- **counters** – ID generation tracking  
- **reviews** – all review submissions  
- **okr_data** – OKR tracking  
- **review_cycles** – cycle management  
- **form_config** – dynamic review forms  

---


## 🖼️ Architecture Diagram

<img width="2121" height="1254" alt="performedge_architecture" src="https://github.com/user-attachments/assets/c0fba07b-573e-41c8-8a3c-eebce87579c0" />


---



