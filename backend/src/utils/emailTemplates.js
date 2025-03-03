export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>Regards, resolveX Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We're writing to confirm that your password has been successfully reset.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>If you did not initiate this password reset, please contact our support team immediately.</p>
    <p>For security reasons, we recommend that you:</p>
    <ul>
      <li>Use a strong, unique password</li>
      <li>Enable two-factor authentication if available</li>
      <li>Avoid using the same password across multiple sites</li>
    </ul>
    <p>Thank you for helping us keep your account secure.</p>
    <p>Best regards,<br>Regards, resolveX Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>Regards, resolveX Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <title>Welcome Email</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);">
        
        
        <!-- Company Logo with Figma Link -->
        <tr>
            <td align="center" style="padding: 20px;">
                <img src="https://res.cloudinary.com/drsfnh7w7/image/upload/v1740983717/Logo_yu14xk.png" alt="Company Logo" width="
512 " style="display: block; max-width: 100%; height: auto;">
                </a>
            </td>
        </tr>


        <!-- Welcome Message -->
        <tr>
            <td style="padding: 20px;">
                <h2 style="color: #000000; margin-bottom: 10px;">Welcome, Ali!</h2>
                <p style="color: #333333;">Thanks for choosing <strong>resolveX</strong>! We are happy to see you on board.</p>
                <p>To get started, do this next step:</p>
            </td>
        </tr>

        <!-- Next Step Button -->
        <tr>
            <td align="center" style="padding: 10px 20px;">
                <a href="YOUR_LINK_HERE" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; font-size: 16px;">
                    Next Step
                </a>
            </td>
        </tr>

        <!-- Resources Section -->
        <tr>
            <td style="padding: 20px;">
                <p>If you need some help to get started, check out:</p>
                
                <!-- Get Started Guide -->
                <table width="100%" style="margin-bottom: 10px;">
                    <tr>
                        <td style="background-color: #fdf2f2; padding: 10px; border-radius: 6px; display: flex; align-items: center;">
                            <img src="PLACEHOLDER_IMAGE_URL" alt="Guide Icon" width="30" style="margin-right: 10px; max-width: 100%; height: auto;">
                            <a href="YOUR_GET_STARTED_GUIDE_LINK" style="color: #000000; font-weight: bold; text-decoration: none;">Get Started Guide</a>
                        </td>
                    </tr>
                </table>

                <!-- Onboarding Video -->
                <table width="100%">
                    <tr>
                        <td style="background-color: #fdf2f2; padding: 10px; border-radius: 6px; display: flex; align-items: center;">
                            <img src="PLACEHOLDER_IMAGE_URL" alt="Video Icon" width="30" style="margin-right: 10px; max-width: 100%; height: auto;">
                            <a href="YOUR_ONBOARDING_VIDEO_LINK" style="color: #000000; font-weight: bold; text-decoration: none;">Onboarding Video</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="font-size: 12px; color: #666666; padding: 20px;">
                <p>We hope you enjoy this journey as much as we enjoy creating it for you.</p>
                <p>© resolveX • Lahore Cantt, Lahore • Lahore, 54810, Pakistan</p>
                <a href="YOUR_UNSUBSCRIBE_LINK" style="color: #999999; text-decoration: none;">Unsubscribe</a>
            </td>
        </tr>
    </table>

    <!-- Responsive Styles -->
    <style>
        @media only screen and (max-width: 600px) {
            table {
                width: 100% !important;
            }
            td {
                padding: 15px !important;
            }
            h2 {
                font-size: 20px !important;
            }
            a {
                font-size: 14px !important;
                padding: 10px 20px !important;
            }
        }
    </style>
</body>
</html>

`;
