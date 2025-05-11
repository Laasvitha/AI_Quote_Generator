# 💬 AI Quote Generator ✨


## 🧠 Project Description

The **AI Quote Generator** is a full-stack web app that generates motivational quotes for programmers using **Hugging Face AI**, with smart features like quote customization, saving, exporting, and language translation.

Built for hackathons and productivity enthusiasts, it supports:
- 🎯 Category & language selection
- 🗣️ Text-to-speech
- 💾 Save quotes to MongoDB (linked to your account)
- 🎨 Download as image
- 📊 Admin dashboard & analytics
- 👤 User login system (JWT Auth)

---

## 🛠️ Tech Stack

| Frontend           | Backend             | Database         | APIs             |
|--------------------|---------------------|------------------|------------------|
| HTML, CSS, JS      | Node.js + Express   | MongoDB Atlas    | Hugging Face AI  |
| Chart.js, html2canvas | JWT Auth, Bcrypt  | Mongoose         | LibreTranslate API |

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/Laasvitha/AI_Quote_Generator.git
cd AI_Quote_Generator
````

### 2. Setup Backend (Express + MongoDB)

```bash
cd server
npm install
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_super_secret_key
ADMIN_TOKEN=your_admin_token
HF_API_KEY=your_huggingface_token
```

Then:

```bash
node index.js
```

Runs at `http://localhost:5000`

---

## 🖥️ Deployment

* **Frontend** deployed using **Vercel**: [https://aiquotegen.vercel.app](https://aiquotegen.vercel.app)
* **Backend** hosted via **Render** (or Railway)
* **MongoDB Atlas** used for storing user data and quotes
* Sensitive keys like `.env` excluded using `.gitignore` and secret scanning policies


## 🎥 Demo Video

[▶️ Watch 3-minute walkthrough](One_drive_link)

---

## 📦 Features Overview

* ✨ AI-Powered Quotes from HuggingFace
* 🎙️ Text-to-Speech (TTS)
* 🌐 Language translation (via LibreTranslate)
* ❤️ Save favorite quotes
* 📁 Export to CSV / Image
* 🧑‍💻 Role-based Admin dashboard
* 🎨 Light/Dark themes
* 📈 Visual analytics (Chart.js)

---

## 🛡️ Security

* `.env` secrets are excluded from Git
* GitHub push protection used to avoid token leaks
* Admin routes protected with `ADMIN_TOKEN`
* All API routes require proper authentication

---

## 📬 Contact
🔗 GitHub: [github.com/Laasvitha](https://github.com/Laasvitha)

