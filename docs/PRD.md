# ReadMyCode — Product Requirements Document (PRD)

## 1. Product Vision

**ReadMyCode** is an AI-powered developer tool that automatically generates comprehensive documentation, visual diagrams, and code analysis for any GitHub repository. It eliminates the tedious work of writing README files, API docs, and architecture overviews by leveraging large language models to understand codebases instantly.

**Target Users**: Software developers, open-source maintainers, engineering teams, and hackathon participants who need fast, accurate documentation.

---

## 2. User Stories & Acceptance Criteria

### US-1: Repository Analysis via GitHub URL
**As a** developer,  
**I want to** paste a GitHub repository URL and click "Analyze",  
**So that** the system clones and parses the repository automatically.

**Acceptance Criteria**:
- [ ] User can enter a valid GitHub URL in the input field
- [ ] System validates URL format before submission
- [ ] System clones the repo using git (with ZIP fallback)
- [ ] File tree is parsed and stored
- [ ] User is redirected to the repo overview page on success
- [ ] Error toast is shown on failure with a descriptive message

---

### US-2: Repository Analysis via ZIP Upload
**As a** developer with a private or local project,  
**I want to** upload a ZIP archive of my codebase,  
**So that** I can analyze projects not hosted on GitHub.

**Acceptance Criteria**:
- [ ] User can switch to "ZIP Upload" tab
- [ ] File picker accepts only `.zip` files (max 50MB)
- [ ] System extracts ZIP and parses the file tree
- [ ] Analysis proceeds identically to GitHub URL flow
- [ ] Uploaded ZIP is cleaned up after processing

---

### US-3: AI-Generated README
**As a** developer,  
**I want to** receive an auto-generated README document,  
**So that** I don't have to write project documentation from scratch.

**Acceptance Criteria**:
- [ ] README tab generates Markdown documentation on click
- [ ] Generated README includes: project title, description, features, installation, usage, tech stack
- [ ] Content is rendered with proper Markdown formatting (headings, code blocks, lists)
- [ ] Loading spinner is shown during generation
- [ ] Copy-to-clipboard button is available

---

### US-4: API Documentation Generation
**As a** backend developer,  
**I want to** get auto-generated API endpoint documentation,  
**So that** I can share endpoint references with my team.

**Acceptance Criteria**:
- [ ] API Docs tab lists detected endpoints with method, path, and description
- [ ] Each endpoint shows request/response schema where applicable
- [ ] Endpoints are grouped by resource/module
- [ ] Documentation is presentable and shareable

---

### US-5: Flowchart Diagram Generation
**As a** developer,  
**I want to** see a visual flowchart of my application's control flow,  
**So that** I can understand and present the logic at a glance.

**Acceptance Criteria**:
- [ ] Flowchart tab generates a Mermaid.js diagram
- [ ] Diagram renders visually in the browser
- [ ] If Mermaid parsing fails, an interactive SVG fallback renders automatically
- [ ] Diagram is zoomable and pannable

---

### US-6: Architecture Diagram Generation
**As a** tech lead,  
**I want to** see a high-level architecture diagram of the codebase,  
**So that** I can understand the system design quickly.

**Acceptance Criteria**:
- [ ] Architecture tab generates a system-level Mermaid diagram
- [ ] Shows components, services, and their relationships
- [ ] Falls back to interactive SVG on parsing errors

---

### US-7: Function Explanations
**As a** developer onboarding to a new codebase,  
**I want to** see explanations of key functions,  
**So that** I can understand what each part does without reading every line.

**Acceptance Criteria**:
- [ ] Functions tab lists parsed functions with names, parameters, and file locations
- [ ] Each function has an AI-generated plain-English explanation
- [ ] Functions are grouped by file

---

### US-8: User Authentication
**As a** user,  
**I want to** create an account and log in,  
**So that** my analyzed repositories are saved to my profile.

**Acceptance Criteria**:
- [ ] Registration form with name, email, password
- [ ] Login form with email and password
- [ ] JWT token stored in localStorage on success
- [ ] Protected routes redirect unauthenticated users to login
- [ ] Guest access allows analysis without signing up

---

### US-9: Dashboard & History
**As a** returning user,  
**I want to** see my previously analyzed repositories,  
**So that** I can revisit results without re-analyzing.

**Acceptance Criteria**:
- [ ] Dashboard shows statistics (total repos, recent analyses)
- [ ] History page lists all past analyses with status badges
- [ ] Each entry links back to the full analysis view
- [ ] Repos can be deleted from history

---

### US-10: Responsive Design
**As a** mobile user,  
**I want** the application to work on my phone or tablet,  
**So that** I can review documentation on any device.

**Acceptance Criteria**:
- [ ] All pages are responsive from 320px to 2560px
- [ ] Navigation collapses to a mobile menu on small screens
- [ ] Code blocks and diagrams scroll horizontally on mobile

---

## 3. Feature Priority Matrix

| Priority | Feature | User Story |
|----------|---------|------------|
| P0 (Must) | GitHub URL analysis | US-1 |
| P0 (Must) | README generation | US-3 |
| P0 (Must) | Flowchart generation | US-5 |
| P1 (Should) | ZIP upload | US-2 |
| P1 (Should) | API docs generation | US-4 |
| P1 (Should) | Architecture diagrams | US-6 |
| P1 (Should) | Function explanations | US-7 |
| P2 (Nice) | User auth & history | US-8, US-9 |
| P2 (Nice) | Mobile responsiveness | US-10 |

---

## 4. Non-Functional Requirements

- **Performance**: Repository analysis completes in < 30 seconds for repos under 1000 files
- **Availability**: 99.9% uptime via Vercel serverless deployment
- **Security**: All passwords hashed, JWT auth, CORS protection, input validation
- **Scalability**: Stateless serverless functions scale automatically with traffic
- **Accessibility**: Semantic HTML, keyboard navigation, screen reader compatible labels
