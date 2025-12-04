import { useAuthStore } from "../../store/authStore.js";
import AssignmentDetailPage from "./AssignmentDetailPage.jsx";
import EngineerAssignmentPage from "../engineer/EngineerAssignmentsPage.jsx";

const AssignmentRouter = () => {
  const { user } = useAuthStore();

  if (user.role === "Engineer") {
    return <EngineerAssignmentPage />;
  }
  return <AssignmentDetailPage />;
};

export default AssignmentRouter;
