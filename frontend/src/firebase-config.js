import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.apiKey,
  authDomain: import.meta.env.authDomain,
  projectId: import.meta.env.projectId,
  storageBucket: import.meta.env.storageBucket,
  messagingSenderId: import.meta.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
};

console.log(firebaseConfig);

const app = initializeApp(firebaseConfig);

export default app;
