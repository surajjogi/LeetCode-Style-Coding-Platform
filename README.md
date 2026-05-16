<div align="center">

# 🚀 Code/Arena - AI-Powered Coding Platform

### The Next-Generation LeetCode Clone with Integrated AI

An enterprise-grade, full-stack competitive programming platform that enables users to solve algorithmic challenges, compile code in real-time, and leverage AI-powered assistance. Administrators can instantly generate complete coding problems using Google's Gemini AI.

<p>
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deployment-Cloud%20Ready-orange?style=for-the-badge" />
</p>

</div>

---
## ✨ project review
<img width="775" height="798" alt="Screenshot 2026-04-19 014050" src="https://github.com/user-attachments/assets/76e81248-8e0f-4f72-858e-ab19ea94bf06" />
<img width="1836" height="869" alt="Screenshot 2026-04-19 014003" src="https://github.com/user-attachments/assets/a62b2531-4070-43a5-aef0-8190b620aedc" />
<img width="1737" height="816" alt="Screenshot 2026-04-19 014219" src="https://github.com/user-attachments/assets/301dbfa1-10af-4243-8a5e-6d3f4487a8d2" />
<img width="1786" height="836" alt="Screenshot 2026-04-19 014211" src="https://github.com/user-attachments/assets/b1699ddb-a12e-4a50-a45a-ea16b9c097a5" />
<img width="1810" height="828" alt="Screenshot 2026-04-19 014200" src="https://github.com/user-attachments/assets/37844401-d10d-4057-84d8-57ca2354ab47" />
<img width="1769" height="824" alt="Screenshot 2026-04-19 014146" src="https://github.com/user-attachments/assets/69aa747e-9aa1-4262-bea7-7dce41be782a" />
<img width="1802" height="843" alt="Screenshot 2026-04-19 014110" src="https://github.com/user-attachments/assets/05fa2968-235b-432a-96a7-03bfa34103e5" />

## ✨ Key Features

- **💻 Live Code Execution**: Compiles and runs C++, Java, and JavaScript instantly using the **Judge0 API**.
- **🤖 AI Problem Generator**: Admins can enter a prompt and Google's Gemini AI automatically generates a complete problem with descriptions, visible/hidden test cases, constraints, and starter code.
- **💬 AI Teaching Assistant**: Users can interact with an integrated AI mentor that provides conceptual guidance without revealing direct solutions.
- **🔐 Secure Authentication**: Full JWT-based authentication, role-based access control (Admin/User), and secure password hashing.
- **☁️ Cloud Container Deployment**: Dockerized architecture deployed on cloud infrastructure for scalable and reliable operations.
- **⚡ High Performance Infrastructure**: Optimized backend services with Redis-powered caching and session control.
- **🎨 Premium UI/UX**: Responsive dark-mode interface with a split-pane Monaco Editor environment inspired by VS Code.

---

## 🛠 Technologies Used

### Frontend (User Interface)
![Frontend Stack](https://skillicons.dev/icons?i=react,vite,tailwind,js)

- **React.js & Vite**: High-speed frontend delivery pipeline.
- **Tailwind CSS & DaisyUI**: Rapid, responsive design system.
- **Monaco Editor**: Professional in-browser coding workspace.
- **React-Resizable-Panels**: Dynamic multi-panel editor experience.

### Backend (Server & Database)
![Backend Stack](https://skillicons.dev/icons?i=nodejs,express,mongodb,redis)

- **Node.js & Express.js**: Scalable REST API ecosystem.
- **MongoDB & Mongoose**: Flexible data layer for users, problems, and submissions.
- **Redis**: Fast in-memory caching and token blacklisting.
- **JWT & Bcrypt**: Secure identity and credential management.

### AI, Execution & DevOps
![Services](https://skillicons.dev/icons?i=gcp,docker)

- **Google Generative AI (Gemini 2.5 Flash)**: Powers AI problem generation and coding support.
- **Judge0 API**: Remote code execution engine.
- **Docker**: Containerized deployment for consistency across environments.
- **Cloud Hosting Platform**: Production-ready hosting with scalable deployment workflows.

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- MongoDB connection string
- Google Gemini API Key
- Redis server running (optional for local testing)
- Docker (recommended for deployment)

### Installation

1. **Clone the repository**
2. **Setup Backend (`/Leetcode`)**
   - Run `npm install`
   - Create a `.env` file with `PORT`, `MONGO_STRING`, `JWT_KEY`, and `GEMINI_API_KEY`
   - Run `npm run dev`

3. **Setup Frontend (`/frontend`)**
   - Run `npm install`
   - Run `npm run dev`

4. **Docker Deployment**
   - Build containers using Docker
   - Deploy seamlessly to your preferred cloud provider

---



## ⚠️ Important Notes & Troubleshooting

* **Admin Access:** The "Admin Panel" button in the navigation bar is dynamically hidden. It will **only** appear if you are logged in using an account with Admin privileges (feel free to use the Admin Demo credentials below to test this).
* **AI Generation Errors:** If the "Generate" problem button or the AI Chat Assistant throws an error, it means the Google Gemini API has hit its free-tier rate limit or is experiencing high traffic. Simply wait a minute to bypass the rate limit, or manually create the problem.
* **Code Execution:** The platform uses standard I/O for code execution. The starter code will automatically handle reading inputs and printing outputs, so you only need to focus on the core algorithm logic.

## 🔑 Demo Access

> **Note:** The Admin Panel button in the navbar only appears for admin/demoAdmin roles.

### 👤 Regular User
| Field | Value |
|-------|-------|
| Email | `user@demo.com` |
| Password | `User@1234` |

> Sign up freely with any email to create a regular user account.

---

### 🛡️ Demo Admin *(Read-Only — Safe for Reviewers)*

| Field | Value |
|-------|-------|
| Email | `demo@admin.com` |
| Password | `Demo@1234` |
| Role | `demoAdmin` |

**This account can:**
- ✅ Log into the Admin Panel
- ✅ View all users and platform statistics
- ✅ Browse all problems

**This account CANNOT:**
- 🚫 Create new problems
- 🚫 Update or delete problems
- 🚫 Delete users or change user roles

> ⚠️ **All destructive actions are blocked server-side for this account**, regardless of the UI. Your data is safe.

---

<div align="center">
  <b>Built with ❤️ by Suraj Jogi</b>
</div>
