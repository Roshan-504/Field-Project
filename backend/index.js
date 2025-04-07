import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import admin from 'firebase-admin';
import twilio from 'twilio';

dotenv.config();
const app = express();
app.use(express.json());

// -------------------- FIREBASE FCM SETUP --------------------
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.SERVICE_ACCOUNT_KEY_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// -------------------- TWILIO SETUP --------------------
const twilioClient = twilio(process.env.TWILIO_SID, process.env.AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_NUMBER;

// -------------------- RECIPIENT LIST --------------------
const smsRecipients = [
  "+919321685221",
  "+917350279276",
  "+918850477626",
  "+917039350394"
];

// -------------------- ALERT ENDPOINT --------------------
app.post('/send-alert', async (req, res) => {
  const { species, location, time } = req.body;
  const messageText = `${species} detected at ${location} at ${time}`;

  // 1️⃣ Send Push Notification via Firebase
  const fcmMessage = {
    notification: {
      title: '🚨 Wildlife Alert!',
      body: messageText,
    },
    topic: 'wildlife-alert',
  };

  try {
    const fcmResponse = await admin.messaging().send(fcmMessage);
    console.log("✅ FCM message sent:", fcmResponse);
  } catch (err) {
    console.error("❌ Error sending FCM:", err);
  }

  // 2️⃣ Send SMS to multiple recipients
  for (const number of smsRecipients) {
    try {
      const msg = await twilioClient.messages.create({
        body: messageText,
        from: twilioPhone,
        to: number,
      });
      console.log(`✅ SMS sent to ${number}:`, msg.sid);
    } catch (error) {
      console.error(`❌ SMS failed for ${number}:`, error);
    }
  }

  res.send("✅ Alerts sent via FCM and SMS.");
});

// -------------------- ROOT ENDPOINT --------------------
app.get("/", (req, res) => {
  res.send("🔥 Wildlife Alert API is running!");
});

// -------------------- START SERVER --------------------
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running at http://localhost:${process.env.PORT}`)
);
