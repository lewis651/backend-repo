import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

const client = twilio(accountSid, authToken);

export const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });
    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};