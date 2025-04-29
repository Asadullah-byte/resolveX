

import { Assignment } from "../models/assignmentModel.js";
import { getUserFileModel } from "../models/getUserFileModel.js";

import { prisma } from "../../../../db/connectDB.js";

// Assign engineer to error
export const assignEngineerToError = async (req, res) => {
  try {
    const { fileId, errorId, engineerId, notes } = req.body;
    const clientId = req.user.id;

    const UserFileModel = getUserFileModel(clientId);
    const file = await UserFileModel.findById(fileId);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    const error = file.groqResponse.anomalies.find(
      anomaly => `${anomaly.anomaly_type}_${anomaly.log_entry.substring(0, 10)}` === errorId
    );
    if (!error) return res.status(404).json({ success: false, message: "Error not found" });

    const existingAssignment = await Assignment.findOne({ fileId, errorId });
    if (existingAssignment) return res.status(400).json({ success: false, message: "Already assigned", assignment: existingAssignment });

    const assignment = new Assignment({
      fileId,
      fileModel: 'ClientFile',
      errorId,
      engineerId,
      clientId,
      notes,
      status: 'PENDING',
      messages: [{ senderId: clientId, message: "You have been assigned to resolve this issue." }]
    });

    await assignment.save();

    const engineer = await prisma.user.findUnique({ where: { id: engineerId } });
    if (engineer?.email) {
      await sendAssignmentEmail({
        to: engineer.email,
        subject: "New Assignment Received",
        body: `You've been assigned a new error.\nFile: ${file.fileName}\nError: ${error.anomaly_type}`
      });
    }

    io.to(engineerId).emit("assignment:new", {
      message: "You've been assigned a new error!",
      assignmentId: assignment._id,
    });

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all assignments for current user
export const getErrorAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const query = role === 'Client' ? { clientId: userId } : { engineerId: userId };
    const assignments = await Assignment.find(query).sort({ lastUpdated: -1 }).lean();

    const enriched = await Promise.all(assignments.map(async (a) => {
      const FileModel = getUserFileModel(a.clientId);
      const file = await FileModel.findById(a.fileId);
      const error = file?.groqResponse?.anomalies?.find(
        an => `${an.anomaly_type}_${an.log_entry.substring(0, 10)}` === a.errorId
      );
      return {
        ...a,
        errorDetails: error || null,
        fileName: file?.fileName,
        fileDetails: {
          systemType: file?.groqResponse?.analysis_summary?.system_type,
          analysisDate: file?.createdAt
        }
      };
    }));

    res.json({ success: true, assignments: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get assignment detail
export const getAssignmentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      $or: [{ clientId: userId }, { engineerId: userId }]
    });
    if (!assignment) return res.status(403).json({ success: false, message: "Unauthorized" });

    const FileModel = getUserFileModel(assignment.clientId);
    const file = await FileModel.findById(assignment.fileId);
    const error = file?.groqResponse?.anomalies?.find(
      an => `${an.anomaly_type}_${an.log_entry.substring(0, 10)}` === assignment.errorId
    );

    res.json({
      success: true,
      assignment: {
        ...assignment.toObject(),
        errorDetails: error || null,
        fileName: file?.fileName,
        fileDetails: {
          systemType: file?.groqResponse?.analysis_summary?.system_type,
          analysisDate: file?.createdAt
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update status
export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const assignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, engineerId: userId },
      { status, lastUpdated: new Date(), ...(status === 'RESOLVED' && { resolvedAt: new Date() }) },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Chat messages
export const sendChatMessage = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { message, attachments = [] } = req.body;
    const senderId = req.user.id;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      $or: [{ clientId: senderId }, { engineerId: senderId }]
    });

    if (!assignment) return res.status(403).json({ success: false, message: "Unauthorized" });

    assignment.messages.push({ senderId, message, attachments, sentAt: new Date() });
    assignment.lastUpdated = new Date();
    await assignment.save();

    io.to(assignmentId).emit("chat:message", { senderId, message, sentAt: new Date() });

    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      $or: [{ clientId: userId }, { engineerId: userId }]
    }, { messages: 1 });

    if (!assignment) return res.status(403).json({ success: false, message: "Unauthorized" });

    res.json({ success: true, messages: assignment.messages.sort((a, b) => a.sentAt - b.sentAt) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};