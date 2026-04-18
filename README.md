# Leetcode Project

This is a full-stack web application featuring a Node.js backend and a React (Vite) frontend.

## Project Structure

- `Leetcode/`: The Node.js backend application.
- `frontend/`: The React web application built with Vite.

## Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- `npm` (comes with Node.js) or `yarn`

## Getting Started

Follow the steps below to set up and run both the backend and frontend locally.

### Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Leetcode
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Make sure you configure your `.env` file based on your local setup requirements (e.g., database connection strings, port numbers).

4. Start the backend server:
   ```bash
   npm start
   ```
   *(Or the script you have defined to run the backend, such as `node index.js` or `npm run dev`)*

### Frontend Setup

1. Open a new terminal instance and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. The frontend will typically be accessible at `http://localhost:5173`. Open this URL in your browser to view the application.

## Version Control

A comprehensive `.gitignore` has been provided at the root of the project to ensure `node_modules`, `.env` files, and other environment-specific or generated files are not committed to source control.
