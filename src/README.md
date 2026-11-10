# PaperTrail

> Practice past papers, track your progress, and walk into exams ready.

## Problem Statement

Many students across Africa prepare for national and university exams using scattered, hard-to-find past papers, often shared as photos or PDFs over WhatsApp. There is no easy way to check answers, measure progress, or see which topics need more work.

PaperTrail brings past-paper questions into one place, scores practice attempts instantly, and (in later iterations) shows learners where they are weak.

## Target Users

- **Students** (secondary school and university) preparing for exams
- **Teachers** who want to share practice questions with their class

## Core Features

1. Browse past-paper questions by subject, year, and topic
2. Take a practice quiz and receive an instant score with correct answers
3. User registration and login *(planned)*
4. Attempt history to track results over time *(planned)*
5. Add and manage questions (teacher/admin role) *(planned)*

> **Current status:** Feature 1 (browse and filter questions) is working. Feature 2 (the quiz flow) is in progress.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | JavaScript (Node.js) |
| Backend framework | Express.js |
| Data (initial iteration) | Static JSON file (`src/data/questions.json`) |
| Testing | Jest, Supertest |
| Version control & planning | Git, GitHub, GitHub Projects |
| DevOps *(planned)* | Docker, GitHub Actions CI, Terraform, cloud deployment |

> The questions come from a JSON file for this first iteration to keep the app simple to run and easy to containerise. All data access is isolated in `questions.service.js`, so the file can later be replaced by a database (e.g. MongoDB) without changing the controllers or the quiz service.

## Project Structure

```
papertrail/
├── src/
│   ├── app.js                       # Express app setup
│   ├── server.js                    # Entry point
│   ├── routes/                      # Route definitions
│   ├── controllers/                 # Request/response handling
│   ├── services/                    # Business logic and data access
│   └── data/questions.json          # Past-paper question bank
├── tests/                           # Jest + Supertest tests
├── .env.example                     # Template for environment variables
├── .gitignore
├── LICENSE
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd papertrail
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
5. The API runs at `http://localhost:3000`.

### Run the tests

```bash
npm test
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/questions` | List questions. Optional filters: `subject`, `year`, `topic` |
| POST | `/api/quiz/submit` | Submit answers and receive a score *(in progress)* |

Example: `GET /api/questions?subject=Biology&year=2023`

The correct answer is never included in `GET /api/questions` responses; it is only used server-side when scoring a submission.

## Team

| Name | Role |
|------|------|
| _Team lead name_ | Team Lead |
| _Member name_ | _Role_ |
| _Member name_ | _Role_ |
| _Member name_ | _Role_ |

## Contributing

- `main` is protected: all changes go through a pull request with at least 1 approval.
- Create a feature branch (`feature/<short-name>`), commit often, and open a PR.
- Resolve all review conversations before merging.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
