# 🚀 CivicMind AI

### AI-Powered Hyperlocal Civic Issue Resolution Platform

> Leveraging **Multi-Agent AI** and **Google Cloud Technologies** to enable intelligent, transparent, and collaborative hyperlocal civic issue management.

---

## 🌐 Live Demo

**Application:** https://civic-mind-ai.web.app

---

# 📖 Overview

CivicMind AI is an AI-powered civic engagement platform that enables citizens to identify, report, verify, track, and collaboratively resolve hyperlocal civic issues. By combining intelligent automation with community participation, the platform improves transparency, accountability, and municipal response while promoting smarter urban governance.

Citizens can report issues using images, voice input, automatic GPS detection, and an interactive map. A Multi-Agent AI pipeline processes every report before routing it to the appropriate municipal department, while administrators gain AI-powered insights through a centralized dashboard.

---

# 🎯 Problem Statement

**Community Hero – Hyperlocal Problem Solver**

Traditional civic issue reporting is often fragmented, slow, and lacks transparency. Citizens have limited visibility into issue resolution, while authorities struggle to prioritize reports efficiently.

CivicMind AI bridges this gap through AI-powered automation, real-time collaboration, and intelligent issue management.

---

# ✨ Features

## 👤 Citizen Features

- AI-powered civic issue reporting
- Camera & gallery image upload
- Voice-based issue description
- Automatic GPS location detection
- Interactive map location refinement
- Real-time issue tracking
- Community verification system
- Evidence upload
- XP, Levels & Achievement Badges

---

## 🤖 Multi-Agent AI Pipeline

Every submitted report passes through specialized AI agents:

1. 👁️ Vision Agent
2. 🧠 Categorization Agent
3. ⚡ Priority Agent
4. 🏛️ Routing Agent
5. 🔍 Duplicate Detection Agent
6. 📝 Summary Agent
7. 📊 Insights Agent

---

## 🏛️ Administration

- AI-powered Admin Dashboard
- Incoming report management
- Analytics & monitoring
- Department-wise issue management
- AI-generated summaries
- Intelligent prioritization

---

# 🧠 Multi-Agent AI Workflow

```text
Citizen
      │
      ▼
Report Issue
      │
      ▼
Vision Agent
      │
      ▼
Categorization Agent
      │
      ▼
Priority Agent
      │
      ▼
Routing Agent
      │
      ▼
Duplicate Detection Agent
      │
      ▼
Summary Agent
      │
      ▼
Firestore Database
      │
      ▼
Admin Dashboard
      │
      ▼
AI Insights
```

---

# 🏗️ System Architecture

```text
                     CivicMind AI

                   👤 Citizen/Admin
                          │
                          ▼
          React Frontend (Firebase Hosting)
                          │
                          ▼
          Node.js + Express (Cloud Run)
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
   Gemini API     Firebase Auth      Cloud Firestore
        │                                   │
        └───────────────► Firebase Storage ◄┘
```

---

# 🛠️ Tech Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| Storage | Firebase Storage |
| AI | Gemini API |
| Maps | Leaflet, OpenStreetMap, Nominatim |
| Deployment | Firebase Hosting, Google Cloud Run |

---

# ☁️ Google Technologies Used

- **Gemini API** – Powers the Multi-Agent AI Decision Pipeline.
- **Firebase Authentication** – Secure role-based authentication.
- **Cloud Firestore** – Real-time storage for reports and analytics.
- **Firebase Storage** – Stores uploaded report and evidence images.
- **Firebase Hosting** – Hosts the React frontend.
- **Google Cloud Run** – Hosts backend APIs and AI services.
- **Google AI Studio** – Used during AI development and testing.

---


# 🚀 Local Setup

```bash
# Clone repository
git clone https://github.com/puneethkumar-dev/civic-mind-ai.git

# Install dependencies
npm install

# Start development server
npm run dev
```

---

# 📌 Project Highlights

- ✅ Multi-Agent AI Decision Pipeline
- ✅ Hyperlocal Civic Issue Reporting
- ✅ AI-powered Department Routing
- ✅ Automatic GPS Detection
- ✅ Interactive Community Map
- ✅ Community Verification & Voting
- ✅ Real-time Issue Tracking
- ✅ AI Insights Dashboard
- ✅ Firebase Authentication
- ✅ Google Cloud Deployment

---

# 👨‍💻 Developer

**Puneeth Kumar Kouru**

B.Tech – Computer Science Engineering (AI & ML)

Passionate about AI, Full-Stack Development, and building impactful real-world solutions.

---

# 📜 License

This project was developed as part of the **Vibe2Ship Hackathon 2026**.
