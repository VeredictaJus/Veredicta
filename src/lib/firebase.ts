import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
// (analytics é opcional e só funciona em https/ambiente browser)

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY || "AIzaSyD_c5e5aYp6yZLfgCOwhP7cpBPmUDITadM",
  projectId: import.meta.env.VITE_FB_PROJECT_ID || "veredicta-85b8c",
  appId: import.meta.env.VITE_FB_APP_ID || "1:123456789:web:xxxxxxxxxxxxxxxx",
  authDomain:
    import.meta.env.VITE_FB_AUTH_DOMAIN ||
    `${import.meta.env.VITE_FB_PROJECT_ID || "veredicta-85b8c"}.firebaseapp.com`,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET || "veredicta-85b8c.appspot.com",
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER || "123456789",
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID // opcional
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)