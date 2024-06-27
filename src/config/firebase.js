import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBWn8c0M720lkYXMXUOJHDQIDQop62UM8A",
    authDomain: "railway-facial-tracking.firebaseapp.com",
    projectId: "railway-facial-tracking",
    storageBucket: "railway-facial-tracking.appspot.com",
    messagingSenderId: "413502630264",
    appId: "1:413502630264:web:c4b4249d43ecdfbd5ac08d"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
export { db, auth }
