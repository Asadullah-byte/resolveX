import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  message: { type: String },
  attachments: [String],
  sentAt: { type: Date, default: Date.now },
});

const AssignmentSchema = new mongoose.Schema({
  fileId: { type: mongoose.Types.ObjectId, required: true },
  fileModel: { type: String, default: "ClientFile" },
  errorId: { type: String, required: true },
  clientId: { type: String, required: true },
  engineerId: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ["PENDING", "IN_PROGRESS", "RESOLVED"], default: "PENDING" },
  resolvedAt: { type: Date },
  messages: [MessageSchema],
  lastUpdated: { type: Date, default: Date.now },
  repoUrl: { type: String },
repoAccessToken: { type: String },
repoLinked: { type: Boolean, default: false },

});

export const Assignment = mongoose.model("Assignment", AssignmentSchema);
