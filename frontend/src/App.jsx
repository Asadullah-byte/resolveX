// import FloatingShapes from './components/FloatingShapes.jsx'
import Header from "./components/Header.jsx";
import EmailVerification from "./pages/auth/EmailVerificationPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import SignUpPage from "./pages/auth/SignUpPage.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore.js";
import { useEffect } from "react";
import UploadFiles from "./pages/client/UploadFiles.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ErrorDashboard from "./pages/client/ErrorDashboard.jsx";
import EngineerProfileSetup from "./pages/engineer/EngineerProfilePage.jsx";
import ClientDashboard from "./pages/client/ClientDashboard.jsx";
import AssignmentPage from "./pages/client/AssignmentPage.jsx";
import EngineerAssignmentsPage from "./pages/engineer/EngineerAssignmentsPage.jsx";
import AssignmentDetailPage from "./pages/shared/AssignmentDetailPage.jsx";
import EngineerDashboard from "./pages/engineer/EngineerDashboard.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isCheckingAuth, refreshToken } = useAuthStore();

  console.log('Debug ProtectedRoute:', {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    isCheckingAuth
  });
  
  
  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("Trying to refresh token...");
    // refreshToken();
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check if roles are specified and user has permission
  if (
    allowedRoles &&
    !allowedRoles.map(r => r.toLowerCase()).includes(user?.role?.toLowerCase())
  ) {
    if (user?.role?.toLowerCase() === "engineer") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }


  // Handle function children for conditional rendering
  if (typeof children === 'function') {
    console.log('Rendering function child with user:', user);
    return children({ user });
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    // Redirect based on user role
    if (user.role?.toLowerCase() === "engineer") {
      return <Navigate to="/dashboard" replace />;
    }
    if (user.role?.toLowerCase() === "client") {
      return <Navigate to="/upload" replace />;
    }
    // Optionally, handle unknown roles
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Header />
      <div className="min-h-screen min-w-[360px] bg-gradient-to-br from-gray-50 via-neutral-100 to-neutral-200 flex items-center justify-center relative overflow-hidden pt-18">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Empty element - ProtectedRoute will handle redirection */}
                <div />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <UploadFiles />
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
          <Route
            path="/forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />

          <Route
            path="/reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />

          <Route path="/files/errors" element={<ErrorDashboard />} />
          <Route path="/files/errors/:fileId" element={<ErrorDashboard />} />
          <Route
            path="/unauthorized"
            element={<div>Unauthorized Access</div>}
          />

          <Route
            path="/engineer/profile"
            element={
              <ProtectedRoute allowedRoles={["Engineer"]}>
                <EngineerProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Client", "Engineer"]}>
                {({ user }) =>
                  user.role === "Engineer" ? (
                    <EngineerDashboard />
                  ) : (
                    <ClientDashboard />
                  )
                }
              </ProtectedRoute>
            }
          />

          <Route
            path="/assigned"
            element={
              <ProtectedRoute allowedRoles={["Client"]}>
                <AssignmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRoles={["Engineer"]}>
                <EngineerAssignmentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignment/:assignmentId"
            element={
              <ProtectedRoute allowedRoles={["Client", "Engineer"]}>
                <AssignmentDetailPage />
              </ProtectedRoute>
            }
          />

          {/* catch all routes */}
        </Routes>

        <Toaster />
      </div>
    </>
  );
}

export default App;
