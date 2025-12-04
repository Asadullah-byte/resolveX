  import mongoose from "mongoose";

  const uploadedFileSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Analyzed"],
      required: true,
    },
    groqResponse: { type: Object, default: null },
    createdAt: { type: Date, default: Date.now },
  });

  // Function to return a model for a specific user collection
  export const getUserFileModel = (userId) => {
    if (!userId) throw new Error("User ID is required to access the collection.");

    const userCollection = `user_${userId}_files`; // Naming convention for per-user collections
    return (
      mongoose.models[userCollection] ||
      mongoose.model(userCollection, uploadedFileSchema, userCollection)
    );
  };
