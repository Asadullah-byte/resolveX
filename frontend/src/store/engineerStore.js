import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const SHARED_API_URL = 'http://localhost:3003/shared';
const ENGINEER_API_URL = 'http://localhost:3002/api/engineer';

axios.defaults.withCredentials = true;

const useEngineerStore = create((set, get) => ({
  loading: false,
  error: null,
  profile: null,
  assignments: [],
  messages: [],
  currentSection: 'basic',
  dashboardData: null,

  formData: {
    basic: {
      gender: '',
      dob: '',
      country: '',
      state: '',
      city: '',
      phoneNo: '',
      profilePic: null,
      resume: null,
    },
    career: {
      field: '',
      specialization: '',
      skills: [],
      experience: '',
      bio: '',
      intro: '',
      socialAccounts: {},
    },
    education: [],
  },

  completedSections: {
    basic: false,
    career: false,
    education: false,
  },

  //  Profile
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${ENGINEER_API_URL}/profile`, {
        withCredentials: true,
      });

      const profile = res.data.data;
      set({
        profile,
        formData: {
          basic: {
            gender: profile.gender || '',
            dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
            country: profile.country || '',
            state: profile.state || '',
            city: profile.city || '',
            phoneNo: profile.phoneNo || '',
            profilePic: profile.user.profilePic || null,
            resume: profile.resume || null,
          },
          career: {
            field: profile.career?.field || '',
            specialization: profile.career?.specialization || '',
            skills: profile.career?.skills || [],
            experience: profile.career?.experience || '',
            bio: profile.career?.bio || '',
            intro: profile.career?.intro || '',
            socialAccounts: profile.career?.socialAccounts || {},
          },
          education: profile.education || [],
        },
        completedSections: {
          basic: !!profile.country && !!profile.state && !!profile.city,
          career: !!profile.career?.field && !!profile.career?.specialization,
          education: profile.education?.length > 0,
        }
      });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  submitProfile: async () => {
    const { formData } = get();
    set({ loading: true });
    try {
      const formDataToSend = new FormData();

      // Files
      if (formData.basic.profilePic instanceof File)
        formDataToSend.append('profilePic', formData.basic.profilePic);
      if (formData.basic.resume instanceof File)
        formDataToSend.append('resume', formData.basic.resume);

      // Basic
      Object.entries(formData.basic).forEach(([key, value]) => {
        if (value && !(value instanceof File)) {
          formDataToSend.append(`basic.${key}`, value);
        }
      });

      // Career
      Object.entries(formData.career).forEach(([key, value]) => {
        formDataToSend.append(
          `career.${key}`,
          typeof value === 'object' ? JSON.stringify(value) : value
        );
      });

      formDataToSend.append('education', JSON.stringify(formData.education));

      const res = await axios.put(`${ENGINEER_API_URL}/profile`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      set({ profile: res.data.data });
      return true;
    } catch (err) {
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${ENGINEER_API_URL}/dashboard`, {
        withCredentials: true,
      });
      set({ dashboardData: res.data.data, loading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  //  Assignments
  fetchMyAssignments: async (status) => {
    const { token } = useAuthStore.getState();
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${SHARED_API_URL}/assignments`, {
        params: { status },
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ assignments: response.data.assignments, loading: false });
      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch assignments',
        loading: false,
      });
      return null;
    }
  },

  updateAssignmentStatus: async (assignmentId, status) => {
    const { token } = useAuthStore.getState();
    set({ loading: true, error: null });

    try {
      const response = await axios.patch(
        `${SHARED_API_URL}/assignments/${assignmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ loading: false });
      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to update status',
        loading: false,
      });
      return null;
    }
  },

  //  Chat
  fetchChatMessages: async (assignmentId) => {
    const { token } = useAuthStore.getState();
    set({ loading: true, error: null });

    try {
      const response = await axios.get(
        `${SHARED_API_URL}/${assignmentId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ messages: response.data.messages, loading: false });
      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch messages',
        loading: false,
      });
      return null;
    }
  },

  sendChatMessage: async (assignmentId, message) => {
    const { token } = useAuthStore.getState();
    set({ loading: true, error: null });

    try {
      const response = await axios.post(
        `${SHARED_API_URL}/${assignmentId}/messages`,
        message,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ loading: false });
      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to send message',
        loading: false,
      });
      return null;
    }
  },

  //  Misc
  setCurrentSection: (section) => set({ currentSection: section }),

  updateSection: (section, data) => {
    set(state => ({
      formData: {
        ...state.formData,
        [section]: data,
      },
    }));
    localStorage.setItem(`engineerProfile_${section}`, JSON.stringify(data));
  },

  completeSection: (section) => {
    set(state => ({
      completedSections: {
        ...state.completedSections,
        [section]: true,
      },
    }));
  },

  loadLocalData: () => {
    ['basic', 'career', 'education'].forEach((section) => {
      const saved = localStorage.getItem(`engineerProfile_${section}`);
      if (saved) {
        set(state => ({
          formData: {
            ...state.formData,
            [section]: JSON.parse(saved),
          },
        }));
      }
    });
  },
}));

export default useEngineerStore;
