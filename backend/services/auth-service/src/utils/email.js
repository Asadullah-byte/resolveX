import { WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { transporter, sender } from "./smtpConfig.js";


const sendEmailWithRetry = async (emailData, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail(emailData);
      console.log("Email sent successfully", info.response);
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
    }
  }
};


//On Signup Should send Verification email
export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = email;

  try {
    const response = {
      from: sender,
      to: recipient,
      subject: " Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    };

    await sendEmailWithRetry(response);
    return true;
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email:  ${error} `);
  }
};

//On verify account send welcome email
export const sendWelcomeEmail = async (email, fname) => {
  const recipient = email;
  try {
    const response = {
      from: sender,
      to: recipient,
      subject: " Verify your email",
      html: WELCOME_EMAIL_TEMPLATE,
      category: "Welcome Email",
    };
    await sendEmailWithRetry(response);;
    return true;
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = email;

  try {
    const response = {
      from: sender,
      to: recipient,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    };
    await sendEmailWithRetry(response);
  } catch (error) {
    console.error("Error sending password reset email:", error);

    res.status(400).json({ success: false, message: error.message });
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = email;
  try {
    const response = {
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    };
    await sendEmailWithRetry(response);
  } catch (error) {
    console.error("Error in reset Password", error);
  }
};

export const sendMagicLink = async (email, link) => {
  try {
    const response = {
      from: sender,
      to: email,
      subject: "Your Engineer Access Link",
      html: `Click <a href="${link}">here</a> to access the dashboard. Link expires in 1 hour.`,
      category: "Magic Link"
    };
    
    await sendEmailWithRetry(response);
    console.log("Magic link email sent successfully to", email);
  } catch (error) {
    console.error("Error sending magic link to", email, error);
    throw new Error(`Failed to send magic link: ${error.message}`);
  }
};