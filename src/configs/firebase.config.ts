import fs from "fs";
import path from "path";
import * as admin from "firebase-admin";

const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccountFile =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.resolve(__dirname, "../utils/fireBaseAdminSDK.json");

    const credentialConfig = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      ? {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, "\n"),
        }
      : JSON.parse(fs.readFileSync(serviceAccountFile, "utf-8"));

    admin.initializeApp({
      credential: admin.credential.cert(credentialConfig),
    });
    console.log("Firebase Admin SDK initialized");
  }
  return admin;
};

export { initializeFirebase };
export default admin;
