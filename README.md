# Employee Training Data Management (MERN Stack)

This project is a full-stack MERN (MongoDB, Express, React, Node.js) web application for managing and displaying employee training data. It provides CRUD operations for employee training records and features a modern, responsive UI built with React and TypeScript.

## Project Structure
- `/client` - React + TypeScript frontend
- `/` (root) - Node.js + Express backend

## Getting Started

### Backend
1. Install dependencies:
   ```sh
   npm install
   ```
2. Create a `.env` file in the root with your MongoDB connection string:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```
3. Start the backend server:
   ```sh
   npm run start
   ```

### Frontend
1. Navigate to the `client` folder:
   ```sh
   cd client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm start
   ```

## Features
- Add, view, update, and delete employee training records
- Responsive, modern UI
- RESTful API

---

Replace `your_mongodb_connection_string` with your actual MongoDB URI.
