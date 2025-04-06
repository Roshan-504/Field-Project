import express from 'express';
import dotenv from "dotenv"
import twilio from 'twilio';


const app = express();
app.use(express.json());

dotenv.config()

// Replace with your credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// Replace with your Twilio number
const twilioPhone = process.env.TWILIO_NUMBER;

// Endpoint that Python model will call
app.post('/', async (req, res) => {
  const { species, location, time } = req.body;
  const message = `${species} detected at ${location} at time ${time}`
  const to = "+919321685221"

  try {
    const msg = await twilioClient.messages.create({
      body: message,
      from: twilioPhone,
      to: to,
    });

    console.log('SMS sent:', msg.sid);
    res.send('SMS sent successfully');
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).send('SMS failed');
  }
});

app.listen(process.env.PORT, () => console.log(`Server running on port http://localhost:${process.env.PORT}`));
