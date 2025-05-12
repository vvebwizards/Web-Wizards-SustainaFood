# 🥕 SustainaFood

SustainaFood is a food redistribution platform that connects food donors(organizations or individuals), recipient organizations, and logistics providers(donations transporter) to reduce food waste and fight hunger. The platform ensures efficient collection and delivery of surplus food through smart coordination, real-time tracking, and transparent communication between all parties involved.

---

## 🛠️ Technology Stack

**Frontend**

- React.js for building a responsive and dynamic user interface

**Backend**

- Node.js with Express.js for handling RESTful APIs and core business logic

**Machine Learning API**

- Python with Flask, serving models trained and evaluated in Jupyter Notebook

**Authentication & Authorization**

- JWT (JSON Web Tokens) for stateless and secure user authentication

**Database**

- MongoDB for storing user profiles, donation data, stock, and requests

**DevOps**

- GitHub Actions for CI/CD automation

---


## 📁 Project Structure

```
SustainaFood/
├── backend/                      # Node.js backend
│   ├── config/                  # Configuration files (DB)
│   ├── controllers/            # Route handler logic
│   ├── routes/                 # API route definitions
│   ├── utils/                  # Utility functions
│   ├── helpers/                # Helper functions and services
│   ├── middlewares/           # Custom Express middlewares 
│   ├── services/              # Business logic
│   ├── socket/                # Real-time features 
│   ├── emailTemplates/        # Email templates for notifications
│   └── index.js               # Entry point

├── frontend/                    # React frontend
│   └── src/
│       ├── assets/            # Static files 
│       ├── animations/        # Animations
│       ├── components/        # React components
│       ├── pages/             # Route-based pages
│       ├── context/           # React context for state management        
│       └── App.tsx           # Main application file

├── flask_api/                 # Python Flask API for ML
│   ├── models/                # Trained ML models 
│   └── app.py                 # Flask app with endpoints serving predictions

```
---

## **Clone and Run the Project**

### **1. Clone the Repository**

To get started, clone the project repository to your local machine:

```bash
git clone https://github.com/vvebwizards/Web-Wizards-SustainaFood.git
cd Web-Wizards-SustainaFood
```

### **2. Install Dependencies and Run the Projects**
Install the necessary dependencies for each part of the project:
***Backend***
```bash
cd backend
npm install
npm run dev

```
***Frontend***
```bash
cd frontend
npm install
npm run dev

```
***Flask API***
```bash
cd flask_api
pip install -r requirements.txt
python app.py
```
