import 'dotenv/config';
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
        
    });
}
console.log(!!process.env.FIREBASE_SERVICE_ACCOUNT);


export const db = getFirestore();