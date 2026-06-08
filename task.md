# FinAI - Detailed Daily Task Tracker

This living document breaks down the 8-week (40 working days) implementation plan into a day-by-day checklist for all three developers.

*   **Dev 1:** Frontend (Next.js, Tailwind, Recharts)
*   **Dev 2:** Backend (FastAPI, PostgreSQL, Redis, Auth)
*   **Dev 3:** AI/DevOps (Models, LangChain, Docker, CI/CD, Synthetic Data)

---

## Week 1: Foundation & Infrastructure
- `[x]` **Day 1 (Completed via Automation)**
  - Dev 1: Initialize Next.js project, install Tailwind CSS, create GitHub repository and set up branch protections.
  - Dev 2: Initialize FastAPI project structure, install dependencies, configure environment variables.
  - Dev 3: Create foundational `docker-compose.yml` for local development (PostgreSQL, Redis).
- `[x]` **Day 2**
  - Dev 1: Setup Next.js App Router structure for multi-tenant portals (Merchant, Admin, Analyst).
  - Dev 2: Design PostgreSQL schema, set up Alembic for migrations, create initial tables.
  - Dev 3: Set up GitHub Actions CI for automated linting and testing on PRs.
- `[x]` **Day 3**
  - Dev 1: Implement base UI layout, responsive navigation bar, and sidebar.
  - Dev 2: Create User Models & JWT Authentication logic.
  - Dev 3: Provision AWS S3 buckets (or local MinIO for dev) and basic ChromaDB container.
- `[x]` **Day 4**
  - Dev 1: Build Login/Register and MFA UI screens.
  - Dev 2: Create Authentication API endpoints (Login, Register, Token Refresh).
  - Dev 3: Configure pre-commit hooks (Black, Flake8, Prettier) to enforce code standards.
- `[ ]` **Day 5**
  - Dev 1: Integrate UI with Auth API, store JWT securely in HTTP-only cookies.
  - Dev 2: Implement Role-Based Access Control (RBAC) middleware for API routes.
  - Dev 3: Finalize CI/CD pipeline, create Pull Request templates, and review Git workflow with the team.

## Week 2: Core Data & Mocking
- `[ ]` **Day 6**
  - Dev 1: Create empty Dashboard container components and routing logic based on user role.
  - Dev 2: Create Transaction & Merchant Models in the database.
  - Dev 3: **Write Python script to generate the synthetic historical transaction dataset (with intentional fraud patterns).**
- `[ ]` **Day 7**
  - Dev 1: Implement Tailwind design system (brand colors, fonts, dark mode toggle).
  - Dev 2: Build CRUD APIs for Transactions (with pagination).
  - Dev 3: **Generate and insert 100k+ synthetic records into the local PostgreSQL databases for the team.**
- `[ ]` **Day 8**
  - Dev 1: Build UI for the Transaction History data table with client-side sorting.
  - Dev 2: Build CRUD APIs for Merchant Profiles and Settings.
  - Dev 3: Begin writing basic data ingestion pipeline connecting DB to ML environment.
- `[ ]` **Day 9**
  - Dev 1: Connect Transaction Table UI to Backend APIs.
  - Dev 2: Implement global Audit Logging middleware for all state-changing API requests.
  - Dev 3: Set up EasyOCR python service locally for testing document reading.
- `[ ]` **Day 10**
  - Dev 1: Build server-side pagination and filtering for the Transaction Table.
  - Dev 2: Review API security, implement basic rate limiting via Redis.
  - Dev 3: Review and test synthetic dataset distribution to ensure patterns make sense for forecasting.

## Week 3: Visualizations & WebSockets
- `[ ]` **Day 11**
  - Dev 1: Install Recharts, build mock Revenue/Volume Chart components.
  - Dev 2: Setup FastAPI WebSocket Manager to handle active client connections.
  - Dev 3: Build Isolation Forest baseline model for unsupervised fraud detection.
- `[ ]` **Day 12**
  - Dev 1: Build real-time alert UI notification component (toast notifications).
  - Dev 2: Implement WebSocket broadcast logic to push transaction alerts.
  - Dev 3: Train XGBoost model using the synthetic fraud data.
- `[ ]` **Day 13**
  - Dev 1: Connect Recharts components to live API data.
  - Dev 2: Create optimized PostgreSQL endpoints for aggregated chart metrics (daily/weekly totals).
  - Dev 3: Implement SHAP explainability for XGBoost to extract "why" it flagged fraud.
- `[ ]` **Day 14**
  - Dev 1: Implement real-time WebSocket updates to dynamically update charts without refresh.
  - Dev 2: Add caching to aggregation queries using Redis to improve dashboard load speed.
  - Dev 3: Create FastAPI microservice specifically for ML predictions.
- `[ ]` **Day 15**
  - Dev 1: End-to-End test Dashboard loading & web sockets behavior.
  - Dev 2: Write unit tests for core API endpoints.
  - Dev 3: Connect Backend APIs to the ML Microservice for real-time transaction scoring.

## Week 4: AI Copilot Base
- `[ ]` **Day 16**
  - Dev 1: Build Chat interface UI (input box, message history).
  - Dev 2: Setup API endpoint to receive chat queries and forward to ML service.
  - Dev 3: Initialize LangChain, configure LLM connection (OpenAI/Anthropic), build system prompts.
- `[ ]` **Day 17**
  - Dev 1: Implement message states (loading indicators, error handling, streaming text).
  - Dev 2: Add strict Redis rate limiting specific to expensive chat endpoints.
  - Dev 3: Ingest synthetic merchant data summaries into ChromaDB vector store.
- `[ ]` **Day 18**
  - Dev 1: Connect Chat UI to Backend Chat API endpoint.
  - Dev 2: Audit all API responses to ensure no PII leakage to the ML service.
  - Dev 3: Build basic RAG pipeline to answer simple database queries using context.
- `[ ]` **Day 19**
  - Dev 1: Add Markdown and Chart rendering capabilities inside the Chat UI.
  - Dev 2: Add database logging for all LLM queries for compliance tracking.
  - Dev 3: Tune LLM prompts to prevent hallucinations and strictly answer from retrieved data.
- `[ ]` **Day 20**
  - Dev 1, 2, 3: **End-of-month 1 sync.** Integration testing of the complete Chat flow across all services.

## Week 5: Document Verification & OCR
- `[ ]` **Day 21**
  - Dev 1: Build Document Upload UI with drag-and-drop zone.
  - Dev 2: Setup secure S3 presigned URL generation for direct-to-cloud uploads.
  - Dev 3: Build OpenCV image quality verification script (blur detection, edge detection).
- `[ ]` **Day 22**
  - Dev 1: Implement client-side image validation (size limits, file type checks).
  - Dev 2: Create Document DB Models and state tracking logic (Pending, Approved, Rejected).
  - Dev 3: Integrate OpenCV checks with EasyOCR text extraction pipeline.
- `[ ]` **Day 23**
  - Dev 1: Build "Pending Verification" queue UI for the Analyst portal.
  - Dev 2: Connect S3 upload completion webhook to DB state updates.
  - Dev 3: Create API endpoint to return structured OCR extraction results.
- `[ ]` **Day 24**
  - Dev 1: Connect Analyst UI to document endpoints to view uploaded images side-by-side with data.
  - Dev 2: Implement approve/reject endpoints for Analysts.
  - Dev 3: Refine OCR extraction specifically for PAN and Aadhaar formats using regex.
- `[ ]` **Day 25**
  - Dev 1, 2, 3: Test complete Document flow from merchant upload to analyst approval.

## Week 6: Revenue Forecasting & Advanced ML
- `[ ]` **Day 26**
  - Dev 1: Build Forecasting Chart UI showing historical vs predicted lines.
  - Dev 2: Create forecasting API endpoints to serve prediction data.
  - Dev 3: Train Prophet time-series models on synthetic historical data.
- `[ ]` **Day 27**
  - Dev 1: Add date range pickers and comparative filters to UI.
  - Dev 2: Implement complex database queries for historical comparative trends.
  - Dev 3: Integrate external factors (holidays, weekends) into Prophet model.
- `[ ]` **Day 28**
  - Dev 1: Connect UI to forecasting endpoints.
  - Dev 2: Optimize Redis caching specifically for heavy, long-range forecast queries.
  - Dev 3: Deploy forecasting models to the ML service container.
- `[ ]` **Day 29**
  - Dev 1: Build compliance/audit log UI table for Compliance Officers.
  - Dev 2: Implement fast pagination and text search for audit logs in PostgreSQL.
  - Dev 3: Generate synthetic future transaction data to test forecast accuracy dashboards.
- `[ ]` **Day 30**
  - Dev 1, 2, 3: Complete integration of all ML features. Code reviews of model implementations.

## Week 7: Security Hardening
- `[ ]` **Day 31**
  - Dev 1: Implement Multi-Factor Auth (MFA) token entry UI.
  - Dev 2: Integrate MFA validation logic with JWT generation.
  - Dev 3: Configure SAST (Static Analysis) and dependency scanning in GitHub Actions.
- `[ ]` **Day 32**
  - Dev 1: Audit frontend for XSS and CSRF vulnerabilities.
  - Dev 2: Implement AES-256 application-layer encryption for PII before storing in DB.
  - Dev 3: Review security scan results and patch vulnerable Docker dependencies.
- `[ ]` **Day 33**
  - Dev 1: Ensure Dark Mode is visually perfect and consistent across all portals.
  - Dev 2: Implement strict Role-Based route guards and test edge cases.
  - Dev 3: Configure Prometheus metrics & Grafana alert dashboards.
- `[ ]` **Day 34**
  - Dev 1: Optimize Next.js Lighthouse score, implement Next/Image optimization.
  - Dev 2: Final database query tuning, adding missing indexes.
  - Dev 3: Setup Vault/Secrets management process to remove local `.env` reliance.
- `[ ]` **Day 35**
  - Dev 1: Cross-browser testing (Chrome, Safari, Firefox, Mobile).
  - Dev 2: API Load testing with Locust or K6.
  - Dev 3: Prepare and tag final production Docker images.

## Week 8: Launch Prep & Deployment
- `[ ]` **Day 36**
  - Dev 1: Bug bash - Fix any remaining UI/UX glitches.
  - Dev 2: Bug bash - Fix API edge cases found in load testing.
  - Dev 3: Bug bash - Resolve model latency or inference timeout issues.
- `[ ]` **Day 37**
  - Dev 1: Finalize frontend README and setup documentation.
  - Dev 2: Auto-generate and verify API documentation (Swagger/ReDoc).
  - Dev 3: Deploy complete stack to a Staging environment (AWS/GCP).
- `[ ]` **Day 38**
  - Dev 1, 2, 3: **Staging environment testing.** Run through all core flows as different users.
- `[ ]` **Day 39**
  - Dev 1, 2, 3: Address and fix any critical issues found in Staging.
- `[ ]` **Day 40**
  - Dev 1, 2, 3: **Production deployment**, final sanity checks, and project handover.
