const admin = require("firebase-admin");

try {
  const serviceAccount = require(process.env.service_account_path);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.storageBucket, // Ensure this environment variable is set
  });

  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Admin:", error.message);
}

const bucket = admin.storage().bucket();

module.exports = bucket;
