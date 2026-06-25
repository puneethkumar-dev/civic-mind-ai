# 🚀 CivicMind AI – Product Blueprint
Version: 1.0 (Frozen)
Hackathon: Vibe2Ship 2026
Problem Statement: Community Hero – Hyperlocal Problem Solver

---

# 1. Project Overview

## Project Name

CivicMind AI

## Tagline

Report community issues in under 10 seconds.
AI handles the bureaucracy.

---

# Vision

Empower every citizen to improve their community through effortless issue reporting, intelligent AI analysis, transparent tracking, and collaborative resolution.

---

# Mission

Reduce civic issue reporting effort by more than 90% while increasing transparency and community participation using AI.

---

# Elevator Pitch

CivicMind AI is an AI-powered civic issue reporting platform that enables citizens to report problems such as potholes, water leaks, garbage, and broken streetlights in under 10 seconds.

Instead of making citizens understand government departments and complicated forms, CivicMind AI automatically analyzes images, identifies the issue, assigns priority, routes it to the correct department, detects duplicates, and keeps everyone informed through a transparent timeline.

---

# Why CivicMind Exists

Current civic reporting systems fail because they require citizens to think like government employees.

Citizens don't know:

• Which department handles the issue
• Which category to choose
• Whether it is high priority
• Whether someone already reported it

Our philosophy is simple:

The citizen should describe the problem.

AI should understand everything else.

---

# 2. Product Philosophy

This is the foundation of CivicMind.

Every design decision must follow these principles.

---

## Principle 1

AI should think.

Humans shouldn't.

---

## Principle 2

Never ask a citizen something the phone or AI can determine.

Examples

❌ Category

❌ Department

❌ Priority

❌ Severity

❌ Location (GPS)

AI should determine all of these.

---

## Principle 3

Every report should take less than 10 seconds.

---

## Principle 4

One screen.

One primary action.

---

## Principle 5

Transparency creates trust.

Users should always know what happened to their report.

---

## Principle 6

Accessibility over complexity.

The app should be usable by:

• Elderly people

• Less educated citizens

• First-time smartphone users

---

# 3. Product Goals

Primary Goal

Enable every citizen to report a civic issue in under 10 seconds.

---

Secondary Goals

Increase reporting participation.

Reduce duplicate reports.

Improve issue prioritization.

Improve transparency.

Help authorities respond faster.

---

# 4. Success Metrics

The success of CivicMind is measured by outcomes, not features.

Target Metrics

✔ Report created in under 10 seconds

✔ Maximum 3 interactions before submission

✔ AI confidence above 90% for common issues

✔ Duplicate reports reduced

✔ Transparent timeline for every issue

✔ Easy enough for first-time users

---

# 5. Problem Analysis

Current Problems

Long reporting forms

↓

Confusing categories

↓

Wrong departments

↓

Duplicate complaints

↓

No transparency

↓

Citizens stop reporting

---

Our Solution

Take Photo

↓

Speak or Type One Sentence

↓

AI understands everything

↓

Issue tracked until resolution

---

# 6. Target Users

## Primary User

Citizen

Examples

College student

Working professional

Villager

Shop owner

Resident

Goals

Report issues quickly.

Know what happened afterwards.

---

## Secondary User

Municipality Officer

Goals

View incoming issues.

Update status.

Prioritize critical issues.

---

## Third User

Community Volunteer

Goals

Verify issues.

Help increase transparency.

Support the municipality.

---

# 7. User Personas

## Persona 1

Lakshmi

Age

52

Uses WhatsApp daily.

Not comfortable with forms.

Prefers speaking instead of typing.

Needs:

Large buttons

Simple language

Minimal typing

---

## Persona 2

Ravi

Age

20

College student.

Reports potholes.

Reports broken streetlights.

Wants quick reporting.

---

## Persona 3

Municipality Officer

Needs

Dashboard

Maps

Priorities

Status updates

Not interested in AI details.

Needs decisions.

---

# 8. Unique Selling Proposition

Most civic apps ask citizens to understand bureaucracy.

CivicMind removes bureaucracy.

Instead of

"Fill a complaint."

We say

"Take a photo.

Tell us what happened.

We'll do the rest."

---

# 9. User Experience Rules

These rules are mandatory.

Rule 1

Maximum 3 interactions before issue submission.

---

Rule 2

Large buttons.

Minimum touch area

48px.

---

Rule 3

One action per screen.

---

Rule 4

Icons wherever possible.

Reduce reading.

---

Rule 5

Voice input preferred over typing.

---

Rule 6

Typing is always optional.

---

Rule 7

Never ask unnecessary questions.

---

Rule 8

If AI confidence is high

Auto-submit.

If confidence is low

Ask ONE clarification.

---

# 10. User Journey

Citizen notices issue

↓

Open CivicMind

↓

Tap

📷 Report Issue

↓

Take Photo

↓

GPS captured automatically

↓

(Optional)

Speak one sentence

↓

AI analyzes

↓

Issue submitted

↓

Timeline created

↓

Citizen receives updates

↓

Issue resolved

---

# 11. Feature Prioritization

MUST HAVE

Citizen

• Google Login

• Report Issue

• Camera

• Gallery Upload

• Voice Description

• Text Description

• Auto GPS

• Timeline

• My Reports

• Notifications

---

AI

Vision Analysis

Issue Categorization

Priority

Department Routing

Duplicate Detection

Issue Summary

---

Admin

Dashboard

Status Updates

Search

Filters

Statistics

---

Maps

Issue Pins

Current Location

Filters

---

SHOULD HAVE

Civic Copilot

Daily Summary

Community Verification

---

NICE TO HAVE

Heatmap

Badges

Leaderboard

Predictive Insights

---

WILL NOT BUILD

Blockchain

IoT

Video Analysis

Training Custom ML Models

Complex Analytics

Multi-language Voice

Complaint PDF Generator

---

# 12. Signature Features

## Zero-Effort Reporting

Report in under 10 seconds.

---

## Civic Timeline

Every issue becomes a transparent story.

Example

Reported

↓

AI Analysis

↓

Department Assigned

↓

Work Started

↓

Resolved

---

## Civic Copilot

Natural language assistant.

Example Questions

"Why is my issue pending?"

"Show nearby potholes."

"What should authorities prioritize today?"

---

# 13. Edge Cases

No GPS

↓

Ask user to place marker manually.

---

No Image

↓

Allow voice/text-only report.

---

Blurry Image

↓

Ask user to retake.

---

Duplicate Report

↓

Suggest joining existing issue.

---

Low AI Confidence

↓

Ask one clarification.

---

Offline

↓

Store locally.

Submit automatically when internet returns.

---

# 14. Product Promise

CivicMind promises that reporting a community issue should never feel like filling out a government form.

The citizen's responsibility ends after taking a photo and describing the problem.

From that point onward,

CivicMind AI takes responsibility for understanding, categorizing, routing, tracking, and explaining the issue until it is resolved.

---

# 15. Technical Architecture (FROZEN)

## Overall Architecture

CivicMind AI follows a clean three-layer architecture.

```
Citizen
    │
    ▼
React Frontend (Vite)
    │
REST API
    │
    ▼
Express Backend
    │
 ┌──────────────┬───────────────┐
 ▼              ▼               ▼
Gemini API   Firestore   Firebase Storage
```

### Responsibilities

Frontend
- User Interface
- Authentication
- Maps
- Camera
- Timeline
- API calls

Backend
- Business Logic
- AI Processing
- Validation
- Firestore Access
- Security

Firebase
- Authentication
- Firestore Database
- Storage

Gemini

- Image Understanding
- Categorization
- Priority
- Routing
- Duplicate Detection
- Copilot

---

# 16. Technology Stack

## Frontend

React 19

Vite

Tailwind CSS

React Router

Axios

TanStack Query

Framer Motion

Lucide React

Firebase SDK

Google Maps JavaScript API

---

## Backend

Node.js

Express.js

Firebase Admin SDK

Gemini API

Helmet

Morgan

Cors

dotenv

express-rate-limit

---

## Database

Firestore

---

## Authentication

Firebase Authentication

Google Login

---

## Storage

Firebase Storage

---

## Deployment

Frontend

Firebase Hosting

Backend

Google Cloud Run

---

# 17. Folder Structure

```
civicmind-ai/

client/

server/

docs/

README.md

.gitignore
```

---

## Client Structure

```
src/

assets/

components/

common/

layout/

report/

timeline/

map/

admin/

copilot/

pages/

Landing/

Login/

Home/

Timeline/

Map/

Profile/

Admin/

hooks/

context/

layouts/

routes/

services/

utils/

constants/

types/

App.jsx

main.jsx
```

---

## Server Structure

```
controllers/

routes/

services/

ai/

firebase/

middleware/

config/

utils/

index.js
```

---

# 18. Firestore Database

Collections

```
users

issues
```

Only two primary collections.

Everything else belongs inside documents.

---

## users

```
uid

name

email

photoURL

role

points

badges

createdAt
```

---

## issues

```
issueId

title

description

summary

category

severity

confidence

department

status

location

imageUrl

reportedBy

createdAt

updatedAt

duplicateOf

timeline[]

votes[]

verifiedBy[]
```

---

## Timeline Object

```
title

description

actor

timestamp
```

Example

```
[
 {
   title:"Issue Reported",
   actor:"Citizen"
 },
 {
   title:"AI Analysis Completed",
   actor:"Vision Agent"
 }
]
```

---

# 19. Status Lifecycle

Every issue must follow

```
Reported

↓

AI Verified

↓

Assigned

↓

In Progress

↓

Resolved
```

No other status allowed.

---

# 20. AI Architecture

Internally we use

Gemini.

Externally

We call it

## Civic Intelligence Engine

The engine contains

Vision Agent

Categorization Agent

Priority Agent

Routing Agent

Duplicate Agent

Copilot Agent

---

# Vision Agent

Input

Image

Output

Category

Confidence

Summary

---

# Categorization Agent

Determines

Category

Summary

---

# Priority Agent

Determines

Severity

Urgency

Reason

---

# Routing Agent

Determines

Responsible Department

Roads

Water

Electricity

Sanitation

Public Works

---

# Duplicate Agent

Checks

Nearby Issues

↓

Same Category

↓

Similar Description

↓

Returns

Existing Issue ID

or

No Duplicate

---

# Civic Copilot

Answers

Citizen Questions

Officer Questions

Issue Questions

Dashboard Summaries

---

# 21. API Structure

Authentication

```
POST /auth/google
```

---

Issues

```
POST /issues

GET /issues

GET /issues/:id

PUT /issues/:id/status
```

---

Timeline

```
GET /issues/:id/timeline
```

---

Copilot

```
POST /copilot/chat
```

---

Dashboard

```
GET /dashboard/stats
```

---

# 22. Component Tree

```
App

↓

Layout

↓

Navbar

↓

Pages

↓

Home

↓

ReportCard

↓

Camera

↓

AIResult

↓

Timeline

↓

IssueCard

↓

MapView

↓

Copilot

↓

Profile

↓

AdminDashboard
```

---

# 23. State Management

Use

React Context

for

Authentication

Theme

User

Use

TanStack Query

for

Server Data

Caching

Fetching

Do NOT use

Redux

MobX

Zustand

---

# 24. Environment Variables

Frontend

```
VITE_FIREBASE_API_KEY

VITE_FIREBASE_AUTH_DOMAIN

VITE_FIREBASE_PROJECT_ID

VITE_FIREBASE_STORAGE_BUCKET

VITE_FIREBASE_APP_ID

VITE_MAPS_API_KEY
```

Backend

```
PORT

GEMINI_API_KEY

FIREBASE_PROJECT_ID

GOOGLE_APPLICATION_CREDENTIALS
```

---

# 25. Security Rules

Never expose

Gemini API Key

Firebase Admin SDK

Service Account

Never call Gemini directly from React.

All AI requests must pass through Express.

---

# 26. Coding Standards

Component Naming

PascalCase

Functions

camelCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Every API response

```
success

message

data
```

Standard format

Example

```
{
 success:true,
 message:"Issue created",
 data:{}
}
```

---

# 27. Error Handling

Every endpoint must return

```
success

message

data
```

Never expose

Stack traces

Never expose

API keys

---

# 28. Git Workflow

Branch

development

↓

Merge

↓

main

One feature

One commit

Commit examples

```
Setup Firebase

Authentication

Issue Reporting

Gemini Integration

Timeline

Admin Dashboard

Copilot

Deployment
```

---

# 29. Cursor Rules

Cursor is an implementation assistant.

Cursor never decides

Architecture

Folder Structure

Tech Stack

Database

UX

Prompt Cursor

One feature at a time.

Never ask

"Build the whole app."

Instead

"Implement Authentication"

↓

Test

↓

Commit

↓

Next Feature

---

# 30. Development Roadmap (FROZEN)

The project will be built feature by feature.

No feature starts until the previous feature is fully working.

---

## Sprint 1 — Project Foundation

Goal

Prepare the project for development.

Tasks

- Project scaffold
- React + Vite
- Express
- Tailwind
- Firebase configuration
- Firestore connection
- Firebase Storage
- Routing
- Shared layouts
- Navbar
- Footer
- Theme
- Environment variables

Definition of Done

✓ Project runs

✓ Backend runs

✓ Firebase connected

✓ No console errors

✓ Initial commit complete

---

## Sprint 2 — Authentication

Goal

Secure user login.

Tasks

Google Login

Logout

Protected Routes

Citizen Role

Admin Role

User Context

Definition of Done

✓ Login works

✓ Logout works

✓ User stored in Firestore

✓ Protected routes working

---

## Sprint 3 — Issue Reporting

Goal

Enable citizens to report issues.

Tasks

Camera

Gallery Upload

Voice Input

Text Input

Auto GPS

Firebase Storage Upload

Create Issue

Definition of Done

✓ Image uploaded

✓ Issue stored

✓ Location stored

✓ Timeline created

---

## Sprint 4 — AI Intelligence

Goal

Enable AI automation.

Tasks

Vision Agent

Categorization

Priority

Routing

Duplicate Detection

Issue Summary

Definition of Done

✓ AI returns correct category

✓ AI assigns severity

✓ AI assigns department

✓ Duplicate detection works

---

## Sprint 5 — Citizen Experience

Goal

Transparency.

Tasks

Timeline

My Reports

Notifications

Issue Details

Community Verification

Definition of Done

✓ Timeline visible

✓ Status updates

✓ Reports page complete

---

## Sprint 6 — Maps

Goal

Location awareness.

Tasks

Google Maps

Issue Pins

Filters

Marker Details

Current Location

Definition of Done

✓ Pins displayed

✓ Filters working

✓ Marker navigation

---

## Sprint 7 — Admin Dashboard

Goal

Administration.

Tasks

Statistics

Issue Table

Status Updates

Filters

Search

Definition of Done

✓ Dashboard complete

✓ Status updates working

✓ Statistics visible

---

## Sprint 8 — Civic Copilot

Goal

Natural Language Assistant.

Tasks

Citizen Questions

Admin Questions

Issue Queries

Summary Generation

Definition of Done

✓ Copilot responds correctly

✓ Uses live Firestore data

---

## Sprint 9 — Polish

Goal

Production quality.

Tasks

Animations

Responsive UI

Loading States

Error States

Accessibility

Performance

Definition of Done

✓ Mobile friendly

✓ No broken screens

✓ Fast navigation

---

## Sprint 10 — Deployment

Goal

Submission ready.

Tasks

Firebase Hosting

Cloud Run

README

Google Doc

Testing

Definition of Done

✓ Public URL

✓ GitHub

✓ Documentation

✓ Ready to submit

---

# 31. Definition of Done (DoD)

A feature is complete only if:

✓ Code works

✓ No console errors

✓ Responsive

✓ Loading state exists

✓ Error state exists

✓ Empty state exists

✓ Code reviewed

✓ Committed to Git

If one item is missing,

the feature is NOT complete.

---

# 32. Development Workflow

Every feature follows exactly this sequence.

1.

Understand Feature

↓

2.

Design Feature

↓

3.

Write Cursor Prompt

↓

4.

Cursor Implements

↓

5.

Manual Testing

↓

6.

Bug Fixes

↓

7.

Review

↓

8.

Git Commit

↓

9.

Next Feature

No shortcuts.

---

# 33. Cursor Rules

Cursor is a developer.

NOT an architect.

Cursor may

✓ Write code

✓ Refactor

✓ Explain errors

✓ Create components

Cursor may NOT

✗ Change architecture

✗ Change Firestore schema

✗ Change APIs

✗ Add new features

✗ Change folder structure

Every prompt should implement ONE feature only.

---

# 34. Code Quality Rules

Always

Small reusable components.

Meaningful names.

No duplicated code.

Separate business logic from UI.

Services handle API calls.

Pages assemble components.

Never hardcode API keys.

Never hardcode URLs.

Never hardcode secrets.

---

# 35. Testing Checklist

Every sprint must pass.

Frontend

✓ No broken UI

✓ Responsive

✓ Forms work

✓ Navigation works

Backend

✓ APIs respond

✓ Error handling works

✓ Validation works

AI

✓ Response format correct

✓ Confidence returned

✓ Category returned

✓ Department returned

Database

✓ Data saved correctly

✓ Images uploaded

✓ Timeline updated

---

# 36. Deployment Checklist

Frontend

Firebase Hosting

Backend

Cloud Run

Firestore Rules

Configured

Storage Rules

Configured

Environment Variables

Configured

Google Maps

Working

Gemini

Working

HTTPS

Enabled

Public URL

Accessible

---

# 37. Git Strategy

Branch

development

↓

main

Commit after every completed feature.

Commit Format

feat: authentication

feat: issue reporting

feat: gemini integration

feat: maps

feat: timeline

feat: admin dashboard

feat: civic copilot

fix: upload bug

style: ui improvements

docs: update readme

Never commit broken code.

---

# 38. Evaluation Mapping

Problem Solving

10-second reporting

Transparent tracking

Agentic Depth

Vision Agent

Categorization Agent

Priority Agent

Routing Agent

Duplicate Agent

Copilot

Innovation

Zero-Effort Reporting

Civic Timeline

Civic Copilot

Google Technologies

Firebase

Firestore

Storage

Hosting

Cloud Run

Gemini

Maps

UX

Large buttons

Voice input

Minimal typing

Simple flow

Technical

React

Express

Firestore

Clean architecture

Completeness

Working end-to-end flow

Deployment

Documentation

---

# 39. Demo Flow

Maximum demo time

4 minutes

Story

Citizen notices pothole.

↓

Open CivicMind.

↓

Take photo.

↓

Speak

"Road damaged near bus stop."

↓

AI analyzes.

↓

Category detected.

↓

Priority assigned.

↓

Department assigned.

↓

Issue submitted.

↓

Timeline created.

↓

Admin dashboard updates.

↓

Status changes.

↓

Citizen receives update.

↓

Ask Civic Copilot

"Why is my issue pending?"

↓

AI answers.

↓

End demo.

The demo must tell a story,

not show random features.

---

# 40. Submission Checklist

Before submission

Deployment URL working

GitHub Repository public

README complete

Google Doc complete

Environment variables removed

Secrets not committed

Images loading

Maps working

Authentication working

AI working

Mobile responsive

Final testing complete

---

# 41. Future Scope

The following ideas are intentionally excluded from Version 1.0 and may be explored after the hackathon:

- Multi-language voice interaction
- Offline-first synchronization
- Push notifications
- Heatmaps
- Predictive civic analytics
- Municipal workflow automation
- Citizen reputation system
- Government portal integration
- Open data dashboards
- Smart city IoT integration

---