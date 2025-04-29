import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

const API_URL = "http://localhost:3001/client";
const SHARED_API_URL = "http://localhost:3003/shared";

axios.defaults.withCredentials = true;

const useClientStore = create((set) => ({
  file: [],
  response: null,
  error: null,
  loading: false,
  uploadedFiles: [],
  fileErrors: null,
  engineers: [],
  recommendedEngineers: [],
  dashboardData: null,

  setFile: (files) => set({ file: files }),
  setResponse: (response) => set({ response }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  uploadFile: async () => {
    const { file, setLoading, setResponse, setError, setFile, uploadedFiles } =
      useClientStore.getState();
    const { role, userId, token } = useAuthStore.getState();
  
    console.log("🔵 Zustand uploadFile() triggered");
  
    if (role !== "Client") {
      setError("Unauthorized: Only Clients can upload files");
      console.log("⚠️ Unauthorized role:", role);
      return;
    }
  
    if (!file || file.length === 0) {
      setError("Please select at least one file.");
      console.log("⚠️ No file selected.");
      return;
    }
  
    setLoading(true);
    setError(null);
    setResponse(null);
  
    try {
      for (const f of file) {
        console.log(`🚀 Uploading file: ${f.name}`);
  
        // Set file status to "pending"
        set({
          uploadedFiles: [...uploadedFiles, { name: f.name, status: "pending" }],
        });
  
        const formData = new FormData();
        formData.append("logFiles", f);
  
        const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
  
        console.log("✅ Upload success:", res.data);
  
        // Update file status to "analyzed" after success
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((file) =>
            file.name === f.name ? { ...file, status: "analyzed" } : file
          ),
        }));
      }
  
      setResponse("All files uploaded successfully.");
      setFile([]); // Clear files only after all are processed
  
      // Fetch updated files list after upload
      setTimeout(() => useClientStore.getState().fetchUploadedFiles(), 2000);
    } catch (err) {
      setError("Error uploading files. Please try again.");
    } finally {
      setLoading(false);
    }
  },
  

  // ✅ Corrected function: Fetch analyzed files & AI results
  fetchUploadedFiles: async () => {
    const { userId, token, role } = useAuthStore.getState();

    if (role !== "Client") {
      set({ error: "Unauthorized: Only Clients can access files" });
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/analyzed-files/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }); // ✅ Corrected API endpoint
      set({ uploadedFiles: response.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch files", loading: false });
    }
  },

  errorFilesList: [],

  // Add this action
  fetchErrorFilesList: async () => {
    const { token } = useAuthStore.getState();
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/files/errors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        errorFilesList: response.data.files,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch files list",
        loading: false,
      });
    }
  },

  fetchFileErrors: async (fileId) => {
    const { token } = useAuthStore.getState();
    set({ loading: true, error: null });

    try {
      const response = await axios.get(`${API_URL}/files/${fileId}/errors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ fileErrors: response.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to fetch file errors",
        loading: false,
      });
    }
  },

  // In clientStore.js, update fetchEngineersByDomain
fetchEngineersByDomain: async (domain, severity) => {
  const { token } = useAuthStore.getState();
  set({ loading: true, error: null });

  try {
    const response = await axios.get(`${API_URL}/engineers/recommend`, {
      params: { domain, severity },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    set({
      engineers: response.data.internal,
      recommendedEngineers: response.data.internal, // Store all recommended engineers
      loading: false
    });
    
    return response.data; // Return both internal and upwork engineers
    
  } catch (err) {
    set({
      error: err.response?.data?.error || "Failed to fetch engineers",
      loading: false
    });
    return { internal: [], upwork: [] }; // Return empty arrays on error
  }
},

  assignEngineer: async (engineerId, fileId, errorId, upworkId = null) => {
    const { token } = useAuthStore.getState();
    set({ loading: true, error: null });
    
    try {
      const response = await axios.post(
        `${SHARED_API_URL}/engineers/assign`,
        { engineerId, fileId, errorId, upworkId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ loading: false });
      return response.data;
    } catch (err) {
      set({
        error: err.response?.data?.error || "Failed to assign engineer",
        loading: false,
      });
      return null;
    }
  },

  // Add to useClientStore in clientStore.js
fetchDashboardAnalytics: async () => {
  const { token } = useAuthStore.getState();
  set({ loading: true, error: null });

  try {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const formattedEngineers = response.data.internal?.map(engineer => {
      const career = engineer.engineer?.career || {};
      return {
        id: engineer.userId,
        userId: engineer.userId,
        fname: engineer.fname,
        lname: engineer.lname,
        email: engineer.email,
        profilePic: engineer.profilePic,
        experience: career.experience || 0,
        specialization: career.specialization || '',
        skills: career.skills || [],
        education: engineer.engineer?.education?.map(edu => ({
          degree: edu.degree,
          major: edu.major,
          institute: edu.institute
        })) || [],
        bio: career.bio || "",
        score: engineer.score || 0
      };
    }) || [];

    set({
      engineers: formattedEngineers,
      recommendedEngineers: formattedEngineers,
      dashboardData: {
        fileAnalytics: response.data.fileAnalytics,
        overallStats: response.data.overallStats,
      },
      error: null, // ✅ Reset error
      loading: false
    });

    return { internal: formattedEngineers };
 
  } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to fetch dashboard data",
      loading: false,
    });
    return null;
  }
},

assignEngineerToError: async (engineerId, fileId, errorId, notes = '') => {
  const { token } = useAuthStore.getState();
  set({ loading: true, error: null });

  try {
    const response = await axios.post(
      `${SHARED_API_URL}/assignments/assign`,
      { engineerId, fileId, errorId, notes },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    set({ loading: false });
    return response.data;
  } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to assign engineer",
      loading: false,
    });
    return null;
  }
},

fetchErrorAssignments: async (status) => {
  const { token } = useAuthStore.getState();
  set({ loading: true, error: null });

  try {
    const response = await axios.get(`${SHARED_API_URL}/assignments`, {
      params: { status },
      headers: { Authorization: `Bearer ${token}` },
    });
    set({
      assignments: response.data.assignments,
      loading: false,
    });
    return response.data;
  } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to fetch assignments",
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
      error: err.response?.data?.message || "Failed to update status",
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
      error: err.response?.data?.message || "Failed to send message",
      loading: false,
    });
    return null;
  }
},

fetchChatMessages: async (assignmentId) => {
  const { token } = useAuthStore.getState();
  set({ loading: true, error: null });

  try {
    const response = await axios.get(
      `${SHARED_API_URL}/${assignmentId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    set({
      messages: response.data.messages,
      loading: false,
    });
    return response.data;
  } catch (err) {
    set({
      error: err.response?.data?.message || "Failed to fetch messages",
      loading: false,
    });
    return null;
  }
},
}));

export default useClientStore;
