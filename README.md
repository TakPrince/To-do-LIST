

# Collaborative To-Do List with Real-Time Sync
---

This is a **Collaborative To-Do List** app built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) and **WebSockets**. The app allows multiple users to collaborate on tasks in real-time. Changes made by one user are instantly visible to everyone.

## Key Features

- **Real-Time Updates**: When one user adds, edits, or deletes a task, all other users see the changes immediately.
- **Task Locking**: When a task is being edited, it is locked to prevent others from making changes at the same time.
- **No Account Required**: Users can start using the app without signing up or logging in.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-Time Sync**: WebSockets (Socket.io)

## How to Install and Run

1. **Clone the Repository**  
   First, clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/collaborative-todo-list.git
   cd collaborative-todo-list
   ```

2. **Install Dependencies**  
   Install the required dependencies for both the backend and frontend:

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```
3. **Run the Application**  
   Start the backend and frontend servers:

   ```bash
   # Backend
   cd backend
   npm start

   # Frontend
   cd frontend
   npm run dev
   ```

   Open your browser and go to [http://localhost:5173](http://localhost:5173) to use the app.

## How It Works

- **Real-Time Collaboration**: All users can add, edit, or delete tasks, and the changes will instantly appear on all connected users’ screens.
- **Task Locking**: When you start editing a task, it is locked to prevent other users from making changes to it at the same time.
- **No Login Needed**: Just open the app and start collaborating—no need to sign up or log in.

## Features Coming Soon

- User authentication (login and registration)
- Task categorization and labels
- Mobile optimization

## License

This project is licensed under the MIT License.

---
## Pre-View


![Screenshot 2024-11-23 222148](https://github.com/user-attachments/assets/9b743fa0-857a-4dce-983b-39efd8ffafac)
![Screenshot 2024-11-23 222225](https://github.com/user-attachments/assets/ac4dd996-7d3d-4fc9-8217-849ff3bce08f)

