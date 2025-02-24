import React from "react";
import { GoogleLogin } from "react-google-login";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GoogleAuth = () => {
  const handleSuccess = async (response) => {
    try {
      const { code } = response;
      const res = await axios.post("http://localhost:3000/api/auth/google", {
        code,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
      }
    } catch (error) {
      console.error("Google OAuth error:", error);
      alert("Login failed!");
    }
  };

  const handleFailure = (error) => {
    console.error("Google Login Error", error);
    alert("Google sign-in failed.");
  };

  return (
    <div>
      <h2>Google OAuth 2.0 Login</h2>
      <GoogleLogin
        clientId={process.env.GOOGLE_CLIENT_ID}
        buttonText="Sign in with Google"
        onSuccess={handleSuccess}
        onFailure={handleFailure}
        cookiePolicy={"single_host_origin"}
        responseType="code"
      />
    </div>
  );
};

export default GoogleAuth;
