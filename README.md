# PaperTrail

> Practice past papers, track your progress and walk into exams ready.

## African Context

Students in Africa prepare for national exams using scattered past papers, often PDFs shared over WhatsApp. They cannot check their answers, and many cannot afford extra textbooks or tutors. PaperTrail puts past-paper questions and answers in one place, so any student with a phone or laptop can practice and see their score instantly.

## Team Members

- Yvette Muhoracyeye - Team Lead: repository setup, branch protection ruleset, LICENSE, CODEOWNERS, PR reviews - y.muhoracye@alustudent.com
- Ishimwe Bruno - Backend: Express skeleton, questions API, questions tests - i.bruno@alustudent.com
- Josiane Mukeshimana - Quiz logic: quiz endpoints, scoring service, quiz tests - j.mukeshima@alustudent.com
- Esther Mushimiyimane - Planning and docs: project board, issues, labels, milestone, README - e.mushimiyi@alustudent.com

## Project Overview

PaperTrail is a REST API for exam practice. A student browses past-paper questions, takes a quiz of five random questions without the answers, submits their choices, and receives a score together with the correct answers.

The code is split into routes, controllers, services and data. All data access is isolated in `questions.service.js`, so the JSON file can later be replaced by a database, and the questions and quiz parts could become separate microservices.

Login, attempt history and teacher question management are planned and tracked on the project board. Docker Compose and a CI pipeline are included in Formative 2. Cloud deployment is planned for a later formative.

### Target Users
- Secondary and university students preparing for exams
- Teachers who want to share practice questions with their class

### Core Features
- Feature 1: Browse past-paper questions, filtered by subject, year and topic
- Feature 2: Take a quiz of 5 random questions per subject (correct answers hidden)
- Feature 3: Submit answers and receive a score, percentage and the correct answers

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: None for now (REST API)
- **Database**: JSON file (`src/data/questions.json`); a real database is planned
- **Other**: Jest and Supertest for testing; ESLint for linting; Git, GitHub, GitHub Projects; Docker and Docker Compose; GitHub Actions for CI; Terraform is planned for a later formative.

## Getting Started

### Prerequisites
- Node.js 20.19 or newer
- npm
- Git
- Docker Desktop

### Installation

1. Clone the repository
```bash
git clone https://github.com/Yvette334/papertrail.git
cd papertrail
```

2. Install dependencies and create your environment file
```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
```

3. Run the application
```bash
npm start
```
The API runs at http://localhost:3000

4. Run the tests
```bash
npm test
```

### Running with Docker Compose

Docker Compose runs the PaperTrail API in a container using the project's `Dockerfile`.

#### Prerequisites

- Docker
- Docker Compose

#### Start the application

A `.env` file is optional: Compose starts without one. To customise values, create one from the example:

```bash
cp .env.example .env
```

Build and start the application:

```bash
docker compose up --build
```

The API will be available at:

```text
http://localhost:3000
```

#### Check the health status

The application includes a health check for the `/health` endpoint.

You can test it with:

```bash
curl http://localhost:3000/health
```

A successful response looks like:

```json
{"status":"ok","service":"papertrail"}
```

You can also check the container status with:

```bash
docker compose ps
```

The container should show a `healthy` status.

#### Stop the application

To stop and remove the container and network:

```bash
docker compose down
```

The Compose configuration optionally loads variables from `.env`, maps port `3000` on the host to port `3000` in the container, attaches the service to a named network (`papertrail-net`), uses a restart policy, and monitors the application's health through `/health`.

### Continuous Integration

The workflow in `.github/workflows/ci.yml` runs on every push to a branch other than `main` and on every pull request into `main`. It runs these steps in order, and a failure in any step fails the run:

1. Check out the code and set up Node.js 20 (with npm caching)
2. `npm ci` to install the exact locked dependencies
3. `npm run lint` (ESLint)
4. `npm test` (Jest)
5. `docker build` to build the image
6. A smoke test that starts the container and calls `/health`

The **Lint, test and build** check is required by the `main` ruleset, so a pull request cannot be merged until it passes and has one approval.

Run the same checks locally:
```bash
npm run lint
npm test
docker compose up --build
```

### Usage

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/questions` | List questions. Optional filters: `subject`, `year`, `topic` |
| GET | `/api/quiz?subject=Biology` | 5 random questions, answers hidden |
| POST | `/api/quiz/submit` | Submit answers, receive score and correct answers |

Examples:
```bash
curl "http://localhost:3000/api/questions?subject=Biology&year=2022"
curl "http://localhost:3000/api/quiz?subject=Geography"
curl -X POST http://localhost:3000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"id":12,"answer":0},{"id":13,"answer":2}]}'
```
On Windows PowerShell use `curl.exe`, or open the GET links in a browser. In `answers`, `id` is the question id and `answer` is the index of the chosen option.

## Project Structure

```
papertrail/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   │   └── ci.yml
│   └── CODEOWNERS
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── data/questions.json
├── tests/
│   ├── api.test.js
│   ├── questions.test.js
│   └── quiz.service.test.js
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── eslint.config.js
├── LICENSE
└── package.json
```

## Security and Collaboration Practices

- `.gitignore` excludes `node_modules/`, `.env`, logs and IDE files; `.env.example` lists variable names only.
- `main` is protected by a ruleset, and every change goes through a pull request with a review.
- Work is planned with user stories, labels and a milestone on the project board.

### Branch protection on `main`

| Rule | Why it matters |
|---|---|
| Require a pull request before merging | No one can push straight to `main` by accident |
| Require 1 approval | A second person reviews every change |
| Dismiss stale approvals on new commits | New code must be reviewed again |
| Require status checks to pass | The **Lint, test and build** CI check (lint, tests, Docker build) must be green before merging |
| Require branches to be up to date | Prevents merging changes that conflict with newer work |
| Require conversation resolution | Review comments must be addressed before merging |
| Empty bypass list | The rules apply to administrators too |
| Block force pushes and deletions | Protects the commit history |

## Links

- [Project Board](https://github.com/users/Yvette334/projects/7)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
