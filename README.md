
Workflow Management System
This is a full-stack, monorepo application designed for team and project management. It includes a modern React frontend and a powerful Node.js/Express.js backend, integrated with Prisma for database operations and the Gemini API for smart task generation.

🚀 Features
Team & Member Management: Create teams, assign members, and manage member details (role, max hours, skills).

Project Workflow: Create, view, and manage projects. Projects are assigned to teams for resource allocation.

Gemini Integration: Utilize the Gemini API for AI-powered task assistance and chat features.

Analytics Dashboard: View global or per-team drill-down analytics on member utilization and project metrics.

Full-Stack Monorepo: Separate, clean architecture for the frontend and backend.

🛠️ Prerequisites
Before starting, ensure you have the following installed on your local machine:

Node.js: Version 18 or higher.

npm: Comes bundled with Node.js.

Git: For cloning the repository.

Gemini API Key: Required for the application's AI features.

💻 Local Installation and Setup
1. Clone the Repository
Bash
git clone https://github.com/mins-code/workflow.git
cd workflow
2. Install Dependencies
This is a monorepo. Run the install command from the project root to install dependencies for both the frontend and backend workspaces.

Bash
npm install
3. Backend Configuration (.env)
Navigate to the backend/ directory and create a new file named .env. This file is essential for database connection and API key storage.

Bash
cd backend
touch .env
Add the following configuration, replacing the placeholder values:

Code snippet
# Database: Uses SQLite for local development
DATABASE_URL="file:./dev.db"

# Authentication: Must be a secure, random string
JWT_SECRET="YOUR_VERY_SECURE_RANDOM_SECRET"

# Gemini Integration: Required for AI features
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
4. Initialize the Database
Run these two commands from the backend/ directory to set up the Prisma database schema (using SQLite) and populate it with seed data.

Bash
# Apply migrations to create the dev.db file
npx prisma migrate dev --name initial_setup

# Seed the database with initial users and data
npx prisma db seed
▶️ Running the Application
You need two separate terminal windows for the backend (API) and the frontend (UI).

Terminal 1: Start the Backend (API)
Run this from the backend/ directory.

Bash
npm run dev
The console should output: 🚀 Server running on http://localhost:3000

Terminal 2: Start the Frontend (UI)
Open a new terminal, navigate to the frontend/ directory, and run:

Bash
cd ../frontend
npm run dev
The console will provide the local URL, typically http://localhost:5173. Open this URL in your browser.

🔑 Default Login Credentials
Use one of these seeded accounts to log in after starting the application:

Name	Email	Password (Default)
Alice	alice@example.com	Welcome123!
Bob	    bob@example.com	    Welcome123!
Charlie	charlie@example.com	Welcome123!
