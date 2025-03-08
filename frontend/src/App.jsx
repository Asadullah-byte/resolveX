// import FloatingShapes from './components/FloatingShapes.jsx'
import Header from "./components/Header.jsx";
import EmailVerification from "./pages/EmailVerification.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore.js";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard.jsx";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const {  checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-neutral-100 to-neutral-200 flex items-center justify-center relative overflow-hidden pt-20">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <SignUpPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route path="/verify-email" element={<EmailVerification />} />
      
        </Routes>
        <Toaster />
      </div>
    </>
  );
}



export default App;
