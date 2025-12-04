import { Router } from "express";
import { authorizeRoles } from "../../../common-middleware/roleCheck.js";
import { verifyToken } from "../../../common-middleware/verifyToken.js";
  import {assignEngineerToError,
    getErrorAssignments,
    updateAssignmentStatus,
    sendChatMessage,
    getChatMessages,
    getAssignmentDetails} from "../controller/assignmentController.js"

const router = Router();

router.get(
  "/assignments",
  verifyToken,
  authorizeRoles("Client", "Engineer"),
  getErrorAssignments
);

// Get specific assignment details
router.get(
  "/:assignmentId",
  verifyToken,
  authorizeRoles("Client", "Engineer"),
  getAssignmentDetails
);

// Update assignment status
router.patch(
  "/:assignmentId/status",
  verifyToken,
  authorizeRoles("Engineer"),
  updateAssignmentStatus
);

// Send chat message
router.post(
  "/:assignmentId/messages",
  verifyToken,
  authorizeRoles("Client", "Engineer"),
  sendChatMessage
);

// Get chat messages
router.get(
  "/:assignmentId/messages",
  verifyToken,
  authorizeRoles("Client", "Engineer"),
  getChatMessages
);
router.patch(
  "/assignments/:assignmentId/status",
  verifyToken,
  authorizeRoles("Engineer"),
  updateAssignmentStatus
);



export default router;
