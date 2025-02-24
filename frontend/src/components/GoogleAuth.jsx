import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";


const GoogleAuth= () => {
  const [user, setUser] = useState(null);

  const handleSuccess = async (response) => {
    console.log("Google Response:", response);
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/auth/google",
        { credential: response.credential },
        { withCredentials: true }
      );

      if (data.success) {
        localStorage.setItem("token", data.token);
        setUser(data.user);
      }
    } catch (error) {
      console.error("Google Login Failed:", error.response?.data || error.message);
    }
  };

  const handleFailure = (error) => {
    console.error("Google Login Error:", error);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div>
        {user ? (
          <h2>Welcome, {user.name}</h2>
        ) : (
          <GoogleLogin onSuccess={handleSuccess} onError={handleFailure} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
