# Project Rules — Flask API + React Structure

This document explains the folder structure and development rules for this full-stack project. The project uses **Flask as the backend API** and **React as the frontend application**.

Follow these rules whenever adding, modifying, or removing features so the project stays clean, secure, maintainable, and easy to manage as it grows.

---

## 1. Folder Structure Overview

```text
myapp/
│
├── backend/                         # Flask API backend
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── home_models.py
│   │   │   ├── auth_models.py
│   │   │   └── ... (one file per feature)
│   │   │
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── home_routes.py
│   │   │   ├── auth_routes.py
│   │   │   └── ... (one file per feature)
│   │   │
│   │   ├── forms/
│   │   │   ├── __init__.py
│   │   │   └── ... (only if server-side forms are needed)
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── ... (API validation/serialization schemas)
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── ... (business logic)
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── helpers.py
│   │
│   ├── migrations/
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   └── ... (one test file per feature)
│   │
│   ├── .env
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── run.py
│
├── frontend/                        # React frontend
│   │
│   ├── public/
│   │   └── ...
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ...
│   │   │
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   │   └── Home.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── ... (one folder per feature)
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── ...
│   │   │
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
├── README.md
└── docker-compose.yml               # optional
```

---

## 2. Core Rule: One Feature = One Set of Files

Every feature should be organized separately across the backend and frontend.

Example feature: `products`

Backend:

```text
backend/app/models/product_models.py
backend/app/routes/product_routes.py
backend/app/schemas/product_schemas.py
backend/app/services/product_service.py
backend/tests/test_product.py
```

Frontend:

```text
frontend/src/pages/products/
frontend/src/components/products/
frontend/src/services/productService.js
```

Rules:

* Do not mix unrelated models in the same model file.
* Do not mix unrelated routes in the same route file.
* Do not mix unrelated business logic in the same service.
* Keep frontend pages/components organized by feature.
* Shared frontend components belong in `components/`, not inside a feature folder, when they are genuinely reusable.
* Shared backend utilities belong in `utils/`.
* Feature-specific business logic belongs in its feature service.
* Do not create unnecessary files just to follow the structure. Use a file when the feature actually needs it.

---

## 3. Naming Rules

### Backend

* File names: lowercase with underscores.
* Example: `product_routes.py`
* Model classes: PascalCase.
* Example: `class Product`
* Function names: lowercase with underscores.
* Example: `def get_all_products()`
* Blueprint names: `featurename_bp`.
* Example: `product_bp`

### Frontend

* React component files: PascalCase.
* Example: `ProductCard.jsx`
* Page components: PascalCase.
* Example: `ProductDetails.jsx`
* Service files: camelCase.
* Example: `productService.js`
* Hook files: camelCase beginning with `use`.
* Example: `useAuth.js`
* Utility files: camelCase.
* Example: `formatCurrency.js`

Keep naming consistent throughout the project.

---

## 4. Backend Models Rules

* Each model file should contain only models related to that feature.
* Always import `db` from the app package:

```python
from app import db
```

* Every database model must have a primary key `id` unless there is a documented reason otherwise.
* Use clear column names.
* Example: `email`, not `em`.
* Add relationships only when needed.
* Document non-obvious relationships with a comment.
* Do not put API/business logic inside database models.
* Use SQLAlchemy ORM instead of raw SQL whenever possible.
* Add indexes to columns that are frequently searched or filtered.
* Avoid unnecessary database relationships and queries.

---

## 5. Backend Routes / API Rules

* Each feature route file must define its own Blueprint.
* API routes must use the versioned prefix:

```text
/api/v1/
```

Example:

```text
/api/v1/auth/login
/api/v1/products
/api/v1/products/<id>
```

* Each feature should have its own route module.
* Import only the models, schemas, and services required by that route.
* Keep route functions short.
* Routes should handle HTTP/API concerns, not large business logic.
* Move complex business logic to `services/`.
* Validate incoming API data before processing it.
* Return JSON responses from API routes.
* Use appropriate HTTP status codes.
* Do not write routes directly inside `app/__init__.py`.
* Every Blueprint must be registered inside `app/__init__.py`.

---

## 6. React Frontend Rules

React is responsible for the user interface.

* Do not put database logic in React.
* Do not put Flask/Python code in the frontend.
* React communicates with Flask through API endpoints.
* Use React Router for client-side navigation when routing is required.
* Keep pages inside `src/pages/`.
* Keep reusable UI components inside `src/components/`.
* Keep API communication inside `src/services/`.
* Keep reusable React logic inside `src/hooks/`.
* Keep global application state inside `src/context/` or another dedicated state-management solution when required.
* Keep reusable helper functions inside `src/utils/`.
* Avoid putting large amounts of logic directly inside JSX.
* Avoid unnecessary prop drilling when shared state/context is more appropriate.
* Reuse components instead of duplicating UI code.
* Keep components focused on one responsibility.

---

## 7. React Pages and Components Rules

Each feature should have its own page/component area when appropriate.

Example:

```text
frontend/src/pages/products/
├── ProductList.jsx
├── ProductDetails.jsx
└── ProductCreate.jsx
```

Feature-specific components:

```text
frontend/src/components/products/
├── ProductCard.jsx
├── ProductFilters.jsx
└── ProductForm.jsx
```

Rules:

* Pages represent application screens.
* Components represent reusable UI pieces.
* Do not put an entire application's UI inside `App.jsx`.
* `App.jsx` should mainly handle application structure and routing.
* Avoid duplicated components.
* Keep components reasonably small.
* Extract complex reusable logic into hooks or utilities.

---

## 8. React API / Service Rules

All communication with the Flask API should be centralized through service modules.

Example:

```text
frontend/src/services/
├── api.js
├── authService.js
├── productService.js
└── ...
```

Rules:

* Do not scatter raw `fetch()` or Axios calls throughout many components.
* Create reusable API functions in service files.
* Use the backend API base URL from environment variables.
* Handle API errors consistently.
* Do not expose backend secrets in React environment variables.
* Remember that frontend environment variables can be visible to users after the application is built.
* Only public configuration should be placed in frontend `.env`.

Example:

```text
VITE_API_URL=https://api.example.com/api/v1
```

Never put:

```text
DATABASE_PASSWORD=
SECRET_KEY=
PRIVATE_API_KEY=
```

inside the React frontend environment.

---

## 9. Backend Templates and Static Files

Because React is the frontend, Flask should not be used as the primary template-rendering system.

Do not create feature pages inside:

```text
backend/app/templates/
```

unless a specific backend-rendered page is genuinely required.

Do not put React frontend assets inside Flask's `static/` directory.

Frontend assets belong inside:

```text
frontend/src/assets/
```

Backend-specific static files should only be used when actually required by the backend.

---

## 10. Forms Rules

React normally handles frontend forms.

Rules:

* Use React form components for user-facing forms.
* Perform basic validation on the frontend for user experience.
* Always validate again on the Flask backend.
* Never trust frontend validation.
* If Flask-WTF is required for a backend-rendered form, it may be used.
* API requests should use schema validation on the backend.
* Keep validation logic reusable where possible.

---

## 11. Config and Environment Rules

* Never hardcode secret keys, passwords, tokens, or database URLs.
* Backend secrets belong in the backend `.env`.
* Frontend `.env` may contain only values safe to expose to the browser.
* `.env` files must be listed in `.gitignore`.
* Use `app/config.py` to load backend configuration.
* Use environment variables for environment-specific settings.
* Never commit production secrets to GitHub.
* Never place private API keys in React code.

Backend example:

```text
backend/.env
```

Frontend example:

```text
frontend/.env
```

---

## 12. Database Rules

* Use SQLAlchemy for database access.
* Use Flask-Migrate for database schema changes.
* Never manually edit production database tables when a migration should be used.
* Run migrations after model changes.
* Keep migrations small and understandable.
* Review migration files before applying them.
* Add indexes where appropriate.
* Avoid unnecessary queries.
* Use transactions for operations that must succeed or fail together.

Typical commands:

```bash
flask db migrate
flask db upgrade
```

---

## 13. Testing Rules

Backend tests belong in:

```text
backend/tests/
```

Frontend tests should be located inside the frontend according to the chosen React testing setup.

Every important feature should have tests covering:

* Successful operations.
* Invalid input.
* Authentication/authorization failures.
* Missing resources.
* API error responses.
* Important business logic.
* Important React UI behavior.

Do not consider frontend validation a replacement for backend testing.

---

## 14. General Coding Rules

* Keep functions short and focused.
* Use clear variable and function names.
* Avoid duplicated code.
* Use reusable services/helpers when code genuinely repeats.
* Add comments only where the code is not self-explanatory.
* Follow PEP8 for Python.
* Follow the project's JavaScript/React linting rules.
* Do not introduce unnecessary dependencies.
* Do not rewrite working code without a reason.
* Keep changes focused on the requested feature.
* Do not perform unrelated refactoring while implementing a feature.
* Preserve existing functionality unless the requested change requires modifying it.

---

## 15. Adding a New Feature — Step by Step

When adding a new feature such as `blog`:

### Backend

1. Create the model file if database models are required:

```text
backend/app/models/blog_models.py
```

2. Create the schema file if API validation/serialization is required:

```text
backend/app/schemas/blog_schemas.py
```

3. Create the service file if business logic is required:

```text
backend/app/services/blog_service.py
```

4. Create the API route:

```text
backend/app/routes/blog_routes.py
```

5. Register the Blueprint inside:

```text
backend/app/__init__.py
```

6. Add backend tests:

```text
backend/tests/test_blog.py
```

7. Run migrations if database models changed.

### Frontend

8. Create the feature page folder:

```text
frontend/src/pages/blog/
```

9. Create feature-specific components if needed:

```text
frontend/src/components/blog/
```

10. Create the API service if the feature communicates with Flask:

```text
frontend/src/services/blogService.js
```

11. Add React routes if required.

12. Add frontend tests for important UI behavior.

---

## 16. Security Rules

* Always hash passwords before saving them.
* Never store plain-text passwords.
* Use `werkzeug.security` or `bcrypt`.
* Validate all incoming data on the backend.
* Never trust data sent by React.
* Sanitize/escape user-generated content appropriately.
* Use SQLAlchemy ORM to reduce SQL injection risk.
* Never put secrets in frontend source code.
* Never expose private API keys to React.
* Set file upload restrictions.
* Restrict accepted file types.
* Use authentication and authorization for protected API endpoints.
* Verify authorization on the backend, not only in React.
* Never assume hiding a React button provides security.
* Keep sensitive operations server-side.

---

## 17. CSRF Protection Rules

If authentication uses cookie/session-based authentication:

* Enable CSRF protection.
* Use Flask-WTF or another appropriate CSRF mechanism.
* React API requests must send the required CSRF token.
* Do not disable CSRF protection without a documented reason.
* Use secure cookie settings.

If the API uses token-based authentication instead, implement an appropriate token security strategy and document it.

Never rely on React alone for CSRF protection.

---

## 18. CORS Rules

CORS controls which frontend applications can communicate with the Flask API.

* Use `Flask-CORS`.
* Do not use wildcard origins in production.

Never use:

```python
CORS(app, resources={r"/*": {"origins": "*"}})
```

in production.

Use exact allowed frontend origins.

Example:

```python
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["https://yourdomain.com"]
        }
    }
)
```

* Keep allowed origins in environment variables.
* Enable CORS only where needed.
* Do not allow credentials with wildcard origins.
* Review CORS configuration separately for development, staging, and production.

---

## 19. Brute Force Protection Rules

Use `Flask-Limiter` for sensitive API endpoints.

Recommended starting limits:

* Login: maximum 5 attempts per minute per IP.
* Signup: maximum 5 attempts per hour per IP.
* Password reset: maximum 3 attempts per hour per IP.
* OTP/contact endpoints: maximum 5 attempts per hour per IP.

After repeated failed login attempts, temporarily lock the account when appropriate.

Use generic authentication errors:

```text
Invalid email or password
```

Do not reveal whether an email/account exists.

Log failed authentication attempts without logging passwords or sensitive credentials.

Add CAPTCHA where appropriate for public-facing applications.

---

## 20. Session and Cookie Security Rules

For cookie/session authentication:

* `SESSION_COOKIE_SECURE = True` in production.
* `SESSION_COOKIE_HTTPONLY = True`.
* `SESSION_COOKIE_SAMESITE = 'Lax'` or `'Strict'` where compatible.
* Set a reasonable session lifetime.
* Regenerate session identifiers after login where applicable.
* Never store sensitive information directly in client-side storage unnecessarily.
* Do not store passwords in browser storage.

---

## 21. HTTP Security Headers Rules

Use `Flask-Talisman` or an equivalent security-header solution where appropriate.

Production should include appropriate security headers such as:

* HTTPS enforcement.
* Content Security Policy.
* `X-Frame-Options`.
* `X-Content-Type-Options: nosniff`.
* HSTS.

Security headers must be tested against the actual React frontend and API configuration.

Do not introduce a CSP that unintentionally breaks the application without testing it.

---

## 22. Production Environment Rules

* Never run Flask's development server in production.
* Use a production WSGI server such as Gunicorn.
* Use a reverse proxy such as Nginx where appropriate.
* Serve the built React application using a proper production web server/CDN/reverse proxy.
* Use HTTPS everywhere.
* Disable Flask debug mode.
* Use separate development, staging, and production configurations.
* Keep production secrets outside Git.
* Keep dependency versions controlled.
* Configure production logging.
* Provide friendly error responses.
* Keep regular database backups.
* Use monitoring/error tracking where appropriate.

Typical architecture:

```text
Internet
   │
   ▼
Nginx / Reverse Proxy
   │
   ├── React Frontend
   │
   └── /api/
          │
          ▼
       Gunicorn
          │
          ▼
        Flask
          │
          ▼
       Database
```

---

## 23. SEO Rules

SEO is primarily handled by the React frontend.

For public pages:

* Every page should have a unique title.
* Every important page should have a unique meta description.
* Use a logical heading structure.
* Use clean URLs.
* Add meaningful `alt` text to images.
* Generate and maintain `sitemap.xml`.
* Maintain `robots.txt`.
* Use canonical URLs where needed.
* Optimize page loading performance.
* Make the website responsive.
* Use HTTPS.
* Add Open Graph metadata.
* Add structured data where appropriate.
* Create a proper custom 404 page.

For React applications, consider server-side rendering, static generation, or prerendering when SEO-critical pages require stronger crawler visibility.

---

## 24. GEO Rules

GEO means optimizing content so AI systems such as ChatGPT, Google AI systems, Perplexity, and Claude can understand the website.

Rules:

* Write clear and direct content.
* Answer important questions early.
* Use descriptive headings.
* Use FAQ sections where appropriate.
* Keep facts accurate and up to date.
* Provide clear About and author information where relevant.
* Use structured data such as Schema.org/JSON-LD where appropriate.
* Avoid keyword stuffing.
* Keep important information available as readable HTML content.
* Do not rely only on images for important information.
* Add clear summaries to long-form content.
* Provide sources/references where relevant.
* Keep important content crawlable.
* Maintain `robots.txt` correctly.
* Use `llms.txt` only if it is appropriate for the project's chosen strategy and ecosystem support.
* Keep important content updated.

---

## 25. Error Handling and Logging Rules

Backend:

* Use centralized error handlers.
* Handle common HTTP errors such as:

  * 400
  * 401
  * 403
  * 404
  * 405
  * 409
  * 422
  * 429
  * 500
* Return consistent JSON error responses from API endpoints.
* Log errors using Python's `logging` module.
* Do not use `print()` as the primary production logging mechanism.
* Use rotating log files where file logging is required.
* Never expose stack traces or internal errors in production.
* Use appropriate log levels.

Example API error format:

```json
{
    "success": false,
    "data": null,
    "message": "Resource not found"
}
```

---

## 26. Database Performance Rules

* Add indexes to frequently searched/filtered columns.
* Avoid N+1 queries.
* Use `joinedload` or `selectinload` where appropriate.
* Do not use `Model.query.all()` for large datasets without pagination.
* Use pagination for large result sets.
* Use database connection pooling in production.
* Fetch only required data where practical.
* Use `EXPLAIN` to investigate slow queries.
* Avoid unnecessary database calls inside loops.
* Cache expensive queries when appropriate.

---

## 27. API Rate Limiting and Versioning Rules

All public APIs should use versioning:

```text
/api/v1/
```

Example:

```text
/api/v1/products
/api/v1/auth/login
```

Use consistent response formats.

Success example:

```json
{
    "success": true,
    "data": {},
    "message": ""
}
```

Error example:

```json
{
    "success": false,
    "data": null,
    "message": "Invalid request"
}
```

Use proper HTTP status codes:

* `200` — success
* `201` — created
* `204` — no content
* `400` — bad request
* `401` — unauthenticated
* `403` — forbidden
* `404` — not found
* `409` — conflict
* `422` — validation error
* `429` — rate limited
* `500` — server error

Apply rate limiting to public endpoints.

Document breaking API changes and maintain older API versions for a reasonable transition period.

---

## 28. Input Validation Rules

* Validate every API request on the backend.
* Use Marshmallow, Pydantic, or another appropriate schema validation library.
* Validate:

  * Data type
  * Length
  * Format
  * Required fields
  * Allowed values
* Reject unexpected fields where appropriate.
* Never rely only on React validation.
* Never assume a request from the React application is trustworthy.
* Validate again before database operations.

---

## 29. File Upload Security Rules

If the application supports uploads:

* Validate file extension.
* Validate MIME type.
* Do not trust the original filename.
* Set a maximum upload size.
* Generate unique/random filenames.
* Prevent path traversal.
* Store uploads outside executable application code where possible.
* Use cloud storage for production where appropriate.
* Do not allow uploaded files to execute as scripts.
* Scan files for malware where appropriate.
* Validate images/files before processing them.

---

## 30. Environment and Dependency Management Rules

Backend:

* Always use a Python virtual environment.
* Do not install project dependencies globally.
* Keep production and development requirements separate.

```text
requirements.txt
requirements-dev.txt
```

* Pin dependency versions where appropriate.
* Regularly check for outdated/vulnerable packages.
* Use tools such as `pip-audit` where appropriate.

Frontend:

* Use the project's package manager consistently.
* Keep `package.json` and lock files committed.
* Do not manually modify installed dependencies.
* Review dependency updates before applying them.
* Remove unused dependencies.

---

## 31. Caching Rules

Use caching only where it provides a real performance benefit.

Backend options may include:

* Flask-Caching
* Redis
* Other appropriate cache systems

Rules:

* Cache data that does not change frequently.
* Do not cache sensitive data carelessly.
* Set expiration times.
* Invalidate or refresh cached data when underlying data changes.
* Do not cache forever without a documented reason.

Frontend caching may use appropriate React/data-fetching tools when required.

---

## 32. Background Jobs Rules

Use Celery, RQ, or another job queue for long-running tasks such as:

* Sending emails.
* Sending notifications.
* Image processing.
* Report generation.
* Large file processing.
* Other slow operations.

Never perform long-running work directly inside an API request if it can block the user unnecessarily.

Add retry logic for recoverable failures.

Monitor background jobs for failed or stuck tasks.

---

## 33. API Documentation Rules

Document all public API endpoints using Swagger/OpenAPI.

Possible tools include:

* Flask-Smorest
* Flasgger
* Other OpenAPI-compatible solutions

Documentation should include:

* Endpoint.
* HTTP method.
* Authentication requirements.
* Parameters.
* Request body.
* Validation requirements.
* Response format.
* HTTP status codes.
* Example requests.
* Example responses.
* Error responses.

Keep API documentation synchronized with the actual API.

---

## 34. Accessibility Rules

React UI must follow accessibility best practices.

* Use semantic HTML.
* Use `<button>` for buttons.
* Use `<nav>` for navigation.
* Use `<label>` for form fields.
* Connect labels correctly to inputs.
* Add meaningful `alt` text.
* Support keyboard navigation.
* Maintain readable color contrast.
* Add `aria-label` where needed.
* Do not rely only on color to communicate information.
* Provide visible focus states.
* Ensure interactive elements are accessible using the keyboard.

---

## 35. Code Review and Git Workflow Rules

Use clear branch names:

```text
feature/cart-page
feature/product-api
fix/login-bug
hotfix/payment-error
```

Use clear commit messages:

```text
fix: correct total price calculation
feat: add product API
refactor: separate authentication routes
```

Rules:

* Do not commit directly to `main` unless the project workflow explicitly allows it.
* Use feature/fix branches.
* Review code before merging.
* Check for security issues.
* Check for unused code.
* Check project-rule violations.
* Keep commits small and focused.
* Do not mix unrelated changes.
* Check `.gitignore` before committing.
* Never commit secrets.

---

## 36. Monitoring and Health Check Rules

Add a backend health endpoint:

```text
GET /health
```

It should return a simple successful response when the application is healthy.

For production:

* Use uptime monitoring.
* Use error tracking such as Sentry where appropriate.
* Monitor response time.
* Monitor error rate.
* Monitor request count.
* Monitor database health.
* Monitor background jobs where applicable.

Do not expose sensitive system information through health endpoints.

---

## 37. Internationalization (i18n) Rules

The React frontend is responsible for user-facing language selection and presentation.

For multilingual applications:

* Use an appropriate React i18n solution.
* Keep user-facing text in translation files.
* Do not hardcode repeated user-facing strings throughout components.
* Support Urdu/Arabic RTL layouts when required.
* Test RTL layouts properly.
* Allow users to select their preferred language.
* Store language preference appropriately.
* Format dates, numbers, and currency according to locale.

The Flask API should return language-independent structured data where possible.

---

## 38. Payment Security Rules

* Never store raw credit card numbers.
* Never store CVV.
* Never handle sensitive card data unnecessarily.
* Use a trusted payment gateway.
* Use the payment gateway's official SDK/API.
* Keep payment-related backend logic isolated.
* Never trust payment success information from React alone.
* Verify payment status server-side.
* Use payment gateway webhooks.
* Store only the payment information required for application records.
* Never log full card numbers or sensitive payment details.
* Keep payment gateway keys in backend `.env`.
* Never put payment gateway secret keys in React.
* Use HTTPS.
* Follow applicable PCI DSS requirements.

---

## 39. Recommended Backend Packages

Add packages only when the project actually needs them.

```text
Flask
Flask-SQLAlchemy
Flask-Migrate
Flask-CORS
Flask-Limiter
Flask-Login
Flask-WTF
bcrypt
python-dotenv
gunicorn
Flask-Caching
Flask-Babel
Marshmallow
Celery
redis
Flasgger
sentry-sdk
```

Do not install every package automatically if the feature is not required.

---

## 40. Recommended Frontend Packages

Use only packages required by the project.

Common choices may include:

```text
react
react-dom
react-router-dom
axios
```

Additional libraries should be introduced only when there is a clear requirement.

Examples:

* Form library for complex forms.
* State-management library for complex global state.
* Data-fetching/caching library for complex API state.
* i18n library for multilingual applications.
* Testing libraries for frontend testing.

Avoid unnecessary dependencies.

---

## 41. Full-Stack Communication Rules

The normal application flow should be:

```text
React UI
   │
   │ HTTP Request
   ▼
Flask API
   │
   ├── Route
   │
   ├── Validation Schema
   │
   ├── Service
   │
   ├── Model
   │
   ▼
Database
```

Response:

```text
Database
   │
   ▼
Flask Service
   │
   ▼
Flask API
   │
   │ JSON
   ▼
React Service
   │
   ▼
React Component
   │
   ▼
User
```

Rules:

* React must never directly connect to the database.
* React must never contain database credentials.
* Business-critical validation must happen on the backend.
* Authorization must happen on the backend.
* API responses should remain consistent.
* Keep frontend and backend responsibilities clearly separated.

---

## 42. Development Workflow

Before implementing a feature:

1. Understand the existing code.
2. Identify the affected backend and frontend areas.
3. Check whether an existing component/service/helper can be reused.
4. Make the smallest change required.
5. Do not rewrite unrelated code.
6. Add or update tests.
7. Run backend tests.
8. Run frontend tests/build.
9. Check for linting/type errors where applicable.
10. Review security implications.
11. Review API changes.
12. Review database migrations if applicable.

---

## 43. Change-Safety Rules

When modifying an existing project:

* Do not overwrite working functionality unnecessarily.
* Do not restructure the entire project for a small feature.
* Do not modify unrelated files.
* Do not change database schema unless required.
* Do not change existing APIs unless required.
* Do not remove existing features without explicit instruction.
* Preserve existing behavior wherever possible.
* Before making a large architectural change, explain the scope and impact.
* Prefer small, reversible changes.
* After changes, verify that existing features still work.

---

## 44. Project Architecture Summary

The project follows this separation:

```text
                    MYAPP
                      │
          ┌───────────┴───────────┐
          │                       │
      FRONTEND                 BACKEND
       React                   Flask
          │                       │
     UI / Pages              API Routes
     Components              Validation
     Hooks                   Services
     Context                 Models
     API Services            Database
          │                       │
          └────────── API ────────┘
```

### Frontend responsibilities

```text
UI
Pages
Components
Client-side routing
User interaction
Frontend validation
API communication
Client-side state
```

### Backend responsibilities

```text
API
Authentication
Authorization
Business logic
Backend validation
Database access
File processing
Payments
Background jobs
Security
Logging
```

### Database responsibilities

```text
Persistent data
Relationships
Indexes
Transactions
Constraints
```

---

## 45. Final Rule

The most important rule is:

> **Make the smallest safe change necessary to implement the requested feature.**

Do not introduce unrelated refactoring, architecture changes, dependency changes, database changes, or UI changes unless they are required for the requested functionality.

The project should remain:

* Modular
* Secure
* Testable
* Scalable
* Maintainable
* Easy to understand
* Easy to deploy
* Easy to extend

This document must be updated whenever the project's architecture or development rules change.
