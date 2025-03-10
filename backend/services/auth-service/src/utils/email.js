import { WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { transporter,sender } from "./smtpConfig.js";


//On Signup Should send Verification email
export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient =  email ;

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

    const info = await transporter.sendMail(response);
    console.log("Email sent successfully", info.response);
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
    const response= {
      from: sender,
      to: recipient,
      subject: " Verify your email",
      html: WELCOME_EMAIL_TEMPLATE,
      category: "Welcome Email",
    };
    const info = await transporter.sendMail(response);
    console.log("Email sent successfully", info.response);
    return true;
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
  }
};


export const  sendPasswordResetEmail = async (email, resetURL) => {
  const recipient  = email;

  try {
    const response = {
      from: sender,
      to: recipient,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL), 
      category: "Password Reset"
    };
    const info = await transporter.sendMail(response);
    console.log("Email sent successfully", info.response);

  } catch (error) {
    console.error("Error sending password reset email:", error);

    res.status(400).json({success: false, message:error.message});
  }
};

export const sendResetSuccessEmail = async(email) => {

  const recipient = email;
  try {
      const response ={
        from: sender,
        to:recipient,
        subject: "Password Reset Successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset"

      };
      const info = await transporter.sendMail(response);
      console.log("Email sent successfully", info.response);
      
  } catch (error) {
    console.error("Error in reset Password", error);
  }
}