import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      userId: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      isCheckingAuth: true,
      message: null,
      refreshAttempted: false,

      setUser: (userData) => {
        console.log(" Setting user:", userData);
        set({
          user: userData,
          role: userData.role,
          userId: userData.userId, // Store userId
          isAuthenticated: true,
        });
      },

      signup: async (email, password, fname, lname, role, companyName) => {
        if (!email || !password || !fname || !lname || !role) {
          console.error("All fields are required.");
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const payload = { email, password, fname, lname, role };

          if (role === "Client") {
            payload.companyName = companyName;
          }

          const response = await axios.post(`${API_URL}/signup`, payload);
          set({
            user: response.data.user,
            role: response.data.user.role,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.response.data.message || "Error signing up",
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
          });
          console.log(" Login Response:", response.data);

          set({
            isAuthenticated: true,
            user: response.data.user,
            role: response.data.user.role,
            userId: response.data.user.id,
            error: null,
            isLoading: false,
          });

          console.log(" Zustand userId after login:", get().userId);
        } catch (error) {
          set({
            error: error.response?.data?.message || "Error logging in",
            isLoading: false,
          });
          throw error;
        }
      },
      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/verify-email`, {
            code,
          });
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          set({
            error: error.response.data.message || "Error verifying email",
            isLoading: false,
          });

          throw error;
        }
      },

      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/check-auth`);
          if (response.data.user && response.data.user.isVerified) {
            set({
              user: response.data.user,
              role: response.data.user.role,
              userId: response.data.user.id,
              isAuthenticated: true,
              refreshAttempted: false,
            });
          } else {
            set({ isAuthenticated: false });
          }
        } catch (error) {
          // Only try to refresh token if not already attempted
          if (!get().refreshAttempted) {
            set({ refreshAttempted: true });
            try {
              await get().refreshToken();
              // Wait a moment for the cookie to be set
              await new Promise(res => setTimeout(res, 200));
              // After refreshing, try checkAuth again
              const response = await axios.get(`${API_URL}/check-auth`);
              if (response.data.user && response.data.user.isVerified) {
                set({
                  user: response.data.user,
                  role: response.data.user.role,
                  userId: response.data.user.id,
                  isAuthenticated: true,
                });
              } else {
                set({ isAuthenticated: false });
              }
            } catch (refreshError) {
              set({ isAuthenticated: false });
            }
          } else {
            set({ isAuthenticated: false });
          }
        } finally {
          set({ isCheckingAuth: false });
        }
      },
      refreshToken: async () => {
        try {
          const response = await axios.post(`${API_URL}/refresh-token`);
          // No need to set isAuthenticated here, wait for checkAuth to confirm
          set({ refreshAttempted: false });
        } catch (error) {
          set({ isAuthenticated: false, user: null, refreshAttempted: true });
        }
      },
      logout: async () => {
        try {
          await axios.post(`${API_URL}/logout`);
        } catch (error) {
          // ... existing code ...
        } finally {
          set({
            user: null,
            role: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
            refreshAttempted: false, // reset on logout
          });
        }
      },
      
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/forgot-password`, {
            email,
          });
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error:
              error.response.data.message ||
              "Error sending reset password email",
          });
          throw error;
        }
      },
      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/reset-password/${token}`,
            { password }
          );
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error.response.data.message || "Error resetting password",
          });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage", //  Key under which data will be stored
      getStorage: () => localStorage, //  Use localStorage instead of sessionStorage or other storage
    }
  )
);
