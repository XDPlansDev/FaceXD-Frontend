// utils/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB57tgxiNqQT9FWWPrDJLbpBsC6JHsMK1s",
  authDomain: "facexd.firebaseapp.com",
  projectId: "facexd",
  storageBucket: "facexd.appspot.com",
  messagingSenderId: "450629686065",
  appId: "1:450629686065:web:10afd7117b1eec15d21610"
};

const app = initializeApp(firebaseConfig);
export default app;
