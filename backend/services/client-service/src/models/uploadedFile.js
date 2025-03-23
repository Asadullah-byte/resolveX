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
});

export const UploadedFile = mongoose.model("uploadedFile", uploadedFileSchema);
