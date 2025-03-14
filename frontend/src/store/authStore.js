import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create(
  (set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,

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

        set({
          isAuthenticated: true,
          user: response.data.user,
          error: null,
          isLoading: false,
        });
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
        const response = await axios.post(`${API_URL}/verify-email`, { code });
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
        if (response.data.user.isVerified === true && response.data.user) {
          set({
            user: response.data.user,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
        }
      } catch (error) {
        set({
          error: error.message,
          isCheckingAuth: false,
          isAuthenticated: false,
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
            error.response.data.message || "Error sending reset password email",
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
  })
);
