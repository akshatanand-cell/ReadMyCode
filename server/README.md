# ReadMyCode — Backend

Express + Node + MongoDB backend powering README generation, API docs, flowcharts,
architecture diagrams, function explanations, and a debugger — from any GitHub repo URL.

## Setup

```bash
cd server
npm install
cp .env.example .env   # if you rename .env, otherwise just edit .env directly
```

Fill in `.env`:

| Var | Where to get it |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string, or `mongodb://localhost:27017/readmycode` |
| `JWT_SECRET` | any random long string |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens (classic, `repo` scope). Optional but avoids rate limits. |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |

```bash
npm run dev   # nodemon, http://localhost:5000
```

## Auth flow

1. `POST /api/auth/register` `{ name, email, password }` → `{ token, user }`
2. `POST /api/auth/login` `{ email, password }` → `{ token, user }`
3. Send `Authorization: Bearer <token>` on every route below.

## Core pipeline

1. `POST /api/repos/analyze` `{ repoUrl }` → clones repo, parses file tree, returns `Repo` doc (`repo._id` is used everywhere below).
2. `POST /api/readme/:repoId` → generates README.md → `AnalysisResult`
3. `POST /api/docs/:repoId` → generates API docs from route/controller files
4. `POST /api/diagrams/flowchart/:repoId` → Mermaid flowchart of execution flow
5. `POST /api/diagrams/architecture/:repoId` → Mermaid architecture diagram
6. `POST /api/diagrams/functions/:repoId` → AST-parsed, AI-explained functions (capped at 25 for demo speed)
7. `POST /api/debug` `{ errorTrace, relevantCode?, repoId? }` → root cause + suggested fix

## Other endpoints

- `GET /api/repos` — list your analyzed repos
- `GET /api/repos/:id` — one repo + its file tree
- `DELETE /api/repos/:id` — deletes DB record + cleans up cloned files on disk
- `GET /api/health` — uptime check

## Notes for demo day

- `githubService.js` clones with `--depth 1` (shallow) for speed.
- `codeParserService.js` uses `@babel/parser` with `errorRecovery: true` so messy
  hackathon-quality code doesn't crash the whole pipeline.
- `functionExplainer.js` caps AI calls at 25 functions per repo — raise `limit` in
  `functionExplainController.js` if you have API budget/time.
- Cloned repos live in `temp_repos/` (gitignored) — deleting a `Repo` doc cleans up its clone.
- All AI calls funnel through `aiService.js` — swap models/providers in one place.
