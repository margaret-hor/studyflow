# StudyFlow

Book tracking web app for managing your reading progress and library.

**Live Demo:** [my-studyflow-app.vercel.app](https://my-studyflow-app.vercel.app)

## ✨ Features

 - **Book Search** - Find books via Google Books API
 - **Progress Tracking** - Track reading page-by-page
 - **Reading Goals** - Set and monitor yearly targets
 - **Personal Library** - Save and organize books
 - **Notes System** - Take Markdown notes on books
 - **Dashboard Analytics** - View reading statistics and streaks

## 🛠️ Tech Stack

 - **Frontend:** React, React Router, SCSS Modules  
 - **Backend:** Firebase Authentication, Firestore Database  
 - **API:** Google Books API  
 - **Hosting:** Vercel  

## 🚀 Quick Start

```bash
git clone https://github.com/margaret-hor/studyflow.git
cd studyflow
npm install
npm run dev
```

## ⚙️ Setup
 - Create Firebase project at firebase.google.com
 - Enable Authentication (Email/Password)
 - Create Firestore Database
 - Get Google Books API key from Google Cloud Console

 - Create .env.local file:
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

## 📖 How to Use
- Sign up with your email
- Set reading goal in dashboard
- Search books in Library tab
- Save books to your collection
- Track progress and take notes
- Monitor stats on dashboard

## 📄 License
This project is licensed under the MIT License. See the LICENSE file for details.