import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:3001/client";

axios.defaults.withCredentials = true;

const useClientStore = create((set) => ({
  file: [],
  response: null,
  error: null,
  loading: false,
  uploadedFiles: [],

  setFile: (files) => set({ file: files }),
  setResponse: (response) => set({ response }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  uploadFile: async () => {
    const { file, setLoading, setResponse, setError,setFile } =
      useClientStore.getState();

    if (!file || file.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    file.forEach((f) => formData.append("logFiles", f));

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setResponse(res.data);
      setFile([]); 
    } catch (err) {
      setError("Error uploading files. Please try again.");
    } finally {
      setLoading(false);
    }
  },

  fetchUploadedFiles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/files`); // Update with your backend URL
      set({ uploadedFiles: response.data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch files", loading: false });
    }
  },
}));

export default useClientStore;
