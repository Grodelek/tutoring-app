# Tutoring App 📚✨

Welcome to **Tutoring App** – a sleek, modern **mobile app** for connecting tutors and students effortlessly! Built with **React Native** for cross-platform performance. 💜

## Testing

Backend: `cd backend/user-service/app && ./mvnw test` (if the checkout lacks the executable bit, use `bash mvnw test`; coverage: `./mvnw jacoco:report`). Frontend: `cd frontend/tutoring-app && npm test`.

Required backend configuration is documented in `backend/user-service/app/src/main/resources/application-example.properties` (`jwt.secret`, `aes.secret`, database settings, and WebSocket origins). Frontend accepts `EXPO_PUBLIC_API_URL` and optionally `EXPO_PUBLIC_WS_URL`; the WebSocket URL otherwise derives from the API URL. Latency test: `npm run test:chat-latency` with the `CHAT_LATENCY_*` variables documented in `scripts/chat-latency-test.js`.

See `TEST_REPORT.md`, `MANUAL_TEST_PLAN.md`, and `CHAT_LATENCY_TEST.md` for results and procedures.

---

## 💻 Technologies & Stack

| Technology          | Version |
|--------------------|---------|
| **React Native**    | 0.72+   |
| **Expo**            | 48+     |
| **TypeScript**      | 5.x     |
| **Node.js**         | 20.x    |
| **PostgreSQL**      | 16.x    |
| **Spring Boot**     | 3.x     |
| **Spring Security** | 6.x     |
| **Hibernate**       | 6.x     |

---

## 🚀 Features

- 🔑 **User Authentication:** Login & Registration with JWT
- 👤 **User Profiles:** Manage personal info and view lessons
- 📚 **Lessons Management:** View, add, and track tutoring sessions
- 🎨 **Modern UI:** Purple-themed sleek mobile interface
- 🌐 **Backend Integration:** Communicates with Spring Boot REST API
- 🔒 **Secure:** Passwords encrypted, JWT-based authentication

---

## ⚡ Installation

```bash
# Clone the repo
git clone https://github.com/Grodelek/tutoring-app.git

# Navigate to project
cd tutoring-app

# Install dependencies
npm install
# or
yarn install

# Start the app (Expo)
npx expo start
```
🔧 Usage

1.Open the app on your mobile device or emulator

2.Register a new account or login

3.Explore lessons and manage your profile

4.All data is synced with the backend via REST API

🤝 Contributing

Feel free to open issues or submit pull requests. Let’s make learning more fun together! 💜
