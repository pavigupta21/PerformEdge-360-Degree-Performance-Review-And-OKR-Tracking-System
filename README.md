# 🚀 PerformEdge  
### 360° Performance Review and OKR Tracking System

PerformEdge is a cloud-based performance management system built using AWS serverless architecture.  
It enables organizations to conduct structured 360° reviews, track OKRs, and generate performance reports with automated workflows and role-based access control.

---

## 🌐 Live Deployment

🔗 http://performedge-host-bucket.s3-website.ap-south-1.amazonaws.com/

---

## 📸 Frontend Screenshots

### 🔹 Dashboard
![Dashboard](screenshots/dashboard.png)

### 🔹 Review Submission
![Review](screenshots/review.png)

### 🔹 HR Dashboard
![HR Dashboard](screenshots/hr_dashboard.png)

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

![Architecture](screenshots/architecture.png)

---



