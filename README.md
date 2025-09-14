# Chat Application

A full-stack real-time chat application where users can register, log in, create channels, send messages, and connect with others. Built using **MERN** stack with **Socket.io** for live communication and deployed on **Vercel** (frontend) and **Render** (backend).

---

##  Live Demo

- **Frontend**: [Chat App UI](https://chat-application-eight-phi.vercel.app)
- **Backend**: [API Server](https://chat-application-4-dska.onrender.com)

---

##  Screenshot

(![Screenshot 2025-07-02 104118](https://github.com/user-attachments/assets/a75be7ca-ba04-4d2c-b449-b6b026ae7b1)
(![Screenshot 2025-07-02 104200](https://github.com/user-attachments/assets/f1a5eb7e-6e24-48c2-b35c-9cc672f20054)
(![Screenshot 2025-07-02 104136](https://github.com/user-attachments/assets/b27923eb-cb9c-45c3-be6b-92054afe59f0)

---

##  Tech Stack

### Frontend:
- React.js
- Vite
- Tailwind CSS
- Zustand (State Management)
- Axios

### Backend:
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT & Cookies for Authentication
- Multer (for file uploads)
- Render (Deployment)

---

##  Features

- User Authentication (Signup / Login)
- Profile Setup (Name, Color, Image Upload)
- Real-Time Chat (Socket.io)
- File Upload/Download with progress bar
- Channel-based & Direct Messaging
- Color Picker for Profile
- Avatar with Upload/Delete Option
- Protected Routes & Auth Middleware
- Responsive UI

---

##  Installation & Local Setup


### 1. Clone the repository:

```bash
git clone https://github.com/Harshini4080/Chat-Application.git
cd Chat-Application
```

### 2. Setup Backend:

```bash
cd server
npm install

```

```bash
git clone https://github.com/Harshini4080/Chat-Application.git
cd Chat-Application
```
Create .env file:

``` bash
 PORT=5000
DATABASE_URL=<your_mongo_uri>
JWT_KEY=<your_jwt_secret>
ORIGIN=http://localhost:5173
PORT=
   ```
Run backend:

```bash
 npm start
   ```

### 3. Setup Frontend

```bash
cd client
npm install

```

Create .env file:
```bash
VITE_SERVER_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

```
Run Frontend:

```bash
npm run dev


```
