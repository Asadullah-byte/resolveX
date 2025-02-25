import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: " Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email:  ${error} `);
  }
};

export const sendWelcomeEmail = async (email, fname) => {
  const recipient = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "8dda9810-b816-4d23-bef3-2d83ca588ea9",
      template_variables: {
        company_info_name: "resolveX",
        name: fname,
        company_info_address: "Lahore Cantt, Lahore",
        company_info_city: "Lahore",
        company_info_zip_code: "54810",
        company_info_country: "Pakistan",
      },
    });
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const  sendPasswordResetEmail = async (email, resetURL) => {
  const recipient  = [{email}];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL), 
      category: "Password Reset"
    })
  } catch (error) {
    console.error("Error sending password reset email:", error);

    res.status(400).json({success: false, message:error.message});
  }
};

export const sendResetSuccessEmail = async(email) => {

  const recipient = [{email}];
  try {
      const response = mailtrapClient.send({
        from: sender,
        to:recipient,
        subject: "Password Reset Successful",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset"

      })    
  } catch (error) {
    console.error("Error in reset Password", error);
  }
}
