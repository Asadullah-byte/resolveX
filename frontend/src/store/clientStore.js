import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:3001/client";

axios.defaults.withCredentials = true;



const useClientStore = create((set) => ({
  file: null,
  response: null,
  error: null,
  loading: false,

  setFile: (file) => set({ file }),
  setResponse: (response) => set({ response }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  uploadFile: async () => {
    const { file, setLoading, setResponse, setError } = useClientStore.getState();

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const formData = new FormData();
    formData.append("logFile", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // Ensure cookies are sent if authentication is needed
      });

      setResponse(res.data);
    } catch (err) {
      setError("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  },
}));

export default useClientStore;

