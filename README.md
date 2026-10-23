# PaperTrail

> Empowering African students with accessible, curriculum-aligned digital quiz practice.

## African Context

In many educational settings across Africa, students face limited access to practice exams and instant feedback tools outside of crowded classrooms. PaperTrail bridges this gap by providing an offline-friendly, lightweight API and quiz platform targeted at regional subjects (Mathematics, Biology, Geography), helping students build confidence and test mastery effectively.

## Team Members

- Yvette (Member 1) - Lead & Infrastructure
- Bruno (Member 2) - Backend & Questions API
- Josiane (Member 3) - Quiz Engine & Testing
- Esther447 / Josiane705 (Member 4) - Docs, Project Board & Hygiene

## Project Overview

PaperTrail is a Node.js and Express backend application designed with a clean multi-layered architecture (Routes → Controllers → Services → Data). It serves curriculum questions, generates randomized quizzes, and scores student submissions securely without exposing correct answers prematurely.

The system is built with lightweight JSON storage to maintain low resource usage, making it fast and simple to deploy in low-bandwidth environments.

### Target Users
- **Students:** Practice subject questions and receive instant score breakdowns.
- **Teachers & Educators:** Access a structured repository of curriculum questions.

### Core Features
- **Question Filtering:** Search questions by subject, year, or topic.
- **Dynamic Quizzes:** Generate 5-question randomized quizzes without exposing answers.
- **Automated Scoring:** Submit user selections for instant score calculations and result breakdowns.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: N/A (REST API Service)
- **Database**: JSON File Repository
- **Other**: Jest, Supertest (Testing)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation

1. Clone the repository
```bash
   git clone [https://github.com/Yvette334/papertrail.git](https://github.com/Yvette334/papertrail.git)
   cd papertrail
Install dependencies

Bash
   npm install
Configure environment variables

Bash
   cp .env.example .env
Usage
Start the application

Bash
   npm start
Run the test suite

Bash
   npm test
API Examples:

Filter Questions: curl "http://localhost:3000/api/questions?subject=Biology"

Start Quiz: curl "http://localhost:3000/api/quiz?subject=Geography"

Submit Answers:

Bash
curl -X POST http://localhost:3000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"id":12,"answer":0},{"id":13,"answer":2}]}'
Project Structure
Plaintext
papertrail/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   │   ├── questions.routes.js
│   │   └── quiz.routes.js
│   ├── controllers/
│   │   ├── questions.controller.js
│   │   └── quiz.controller.js
│   ├── services/
│   │   ├── questions.service.js
│   │   └── quiz.service.js
│   └── data/questions.json
├── tests/
│   ├── quiz.service.test.js
│   └── api.test.js
├── .env.example
├── .gitignore
└── package.json
Links
Project Board: https://github.com/users/Yvette334/projects/7

Repository Issues:https://github.com/Yvette334/papertrail/issues

License
MIT License