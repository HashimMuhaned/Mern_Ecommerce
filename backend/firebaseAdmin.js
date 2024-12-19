const admin = require("firebase-admin");
const serviceAccount = require(process.env.service_account_path);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.storageBucket, // Replace with your Firebase bucket
});

const bucket = admin.storage().bucket();

module.exports = bucket;
