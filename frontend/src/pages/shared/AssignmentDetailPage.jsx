// pages/shared/AssignmentDetailPage.jsx
import { useParams } from "react-router-dom";
import useClientStore from "../../store/clientStore.js";
import useEngineerStore from "../../store/engineerStore.js";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentChat from "../../components/AssignmentChat";
import useVideoCall from "../../hooks/useVideoCall.js";
import { useAuthStore } from "../../store/authStore";
import Split from "react-split";

const AssignmentDetailPage = () => {
  const { assignmentId } = useParams();
  const { user } = useAuthStore();
  const engineerStore = useEngineerStore();
  const clientStore = useClientStore();
  const fetchAssignments = user.role === "Engineer"
    ? engineerStore.fetchMyAssignments
    : clientStore.fetchErrorAssignments;
  const updateAssignmentStatus = user.role === "Engineer"
    ? engineerStore.updateAssignmentStatus
    : clientStore.updateAssignmentStatus;

  const [assignment, setAssignment] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);
  const localRef = useRef();
  const remoteRef = useRef();

  const { endCall } = useVideoCall({
    roomId: assignmentId,
    localVideoRef: localRef,
    remoteVideoRef: remoteRef,
    onCallEnded: () => setCallActive(false),
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetchAssignments();
      const a = res?.assignments?.find((a) => a._id === assignmentId);
      if (a) setAssignment(a);
    };
    load();
  }, [assignmentId]);

  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const handleStartProject = async () => {
    if (!assignment.repoLinked) return;
    setStartTime(Date.now());
    const res = await updateAssignmentStatus(assignment._id, "IN_PROGRESS");
    if (res?.assignment?.status === "IN_PROGRESS") {
      setAssignment((prev) => ({ ...prev, status: "IN_PROGRESS" }));
    }
  };

  const handleEndProject = async () => {
    clearInterval(timerRef.current);
    const res = await updateAssignmentStatus(assignment._id, "RESOLVED");
    if (res?.assignment?.status === "RESOLVED") {
      setAssignment((prev) => ({ ...prev, status: "RESOLVED" }));
    }
  };

  const handleRevokeAccess = async () => {
    const res = await fetch(`http://localhost:3003/auth/github/revoke?assignmentId=${assignment._id}`, {
      method: 'POST',
      credentials: 'include'
    });
    if (res.ok) {
      clearInterval(timerRef.current);
      const updated = await updateAssignmentStatus(assignment._id, "RESOLVED");
      if (updated?.assignment?.status === "RESOLVED") {
        setAssignment((prev) => ({ ...prev, status: "RESOLVED", repoLinked: false, repoUrl: null }));
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Assignment Details
        </Typography>

        {user.role === "Client" && !assignment.repoLinked && (
          <Button
            onClick={() =>
              window.location.href = `http://localhost:3003/auth/github?assignmentId=${assignment._id}`
            }
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
          >
            Link GitHub Repo
          </Button>
        )}

        {user.role === "Client" && assignment.repoLinked && (
          <Button
            onClick={handleRevokeAccess}
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
          >
            Revoke GitHub Access
          </Button>
        )}

        {user.role === "Engineer" && assignment.status === "PENDING" && assignment.repoLinked && (
          <Button
            variant="contained"
            color="success"
            sx={{ mt: 2, mr: 2 }}
            onClick={handleStartProject}
          >
            Start Project
          </Button>
        )}

        {user.role === "Engineer" && assignment.status === "IN_PROGRESS" && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleEndProject}
            >
              End Project
            </Button>
            <Typography variant="body1" color="textSecondary">
              Time Elapsed: {formatTime(elapsed)}
            </Typography>
          </Box>
        )}

        <Box mt={2}>
          <Chip
            label={`Status: ${assignment.status}`}
            color={
              assignment.status === "PENDING"
                ? "warning"
                : assignment.status === "IN_PROGRESS"
                ? "info"
                : "success"
            }
          />
        </Box>
      </Box>

      {assignment.repoLinked && assignment.repoUrl ? (
        <Split
          className="split"
          style={{ display: 'flex', height: 'calc(100% - 140px)' }}
          sizes={[50, 50]}
          minSize={200}
          gutterSize={10}
          direction="horizontal"
          cursor="col-resize"
        >
          <Box sx={{ overflowY: 'auto', p: 2, position: 'relative' }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Error Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{assignment.notes}</Typography>
                    <Typography variant="body2">
                      Error: {assignment.errorDetails?.anomaly_type}
                    </Typography>
                    <Typography variant="body2">
                      Severity: {assignment.errorDetails?.severity}
                    </Typography>
                  </CardContent>
                </Card>
              </AccordionDetails>
            </Accordion>
            <AssignmentChat assignmentId={assignmentId} />
          </Box>

          <Box
            sx={{ position: 'relative', height: '100%', width: '100%', backgroundColor: '#111' }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <iframe
              src={`https://codesandbox.io/embed/github/${assignment.repoUrl}/tree/main/${assignment.repoFolder || ""}?codemirror=1&view=editor&vs=dark&hidenavigation=0&theme=dark`}
              style={{ width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; camera; microphone; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              title="Secure CodeSandbox Editor"
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 10,
                right: 10,
                color: "white",
                opacity: 0.4,
                pointerEvents: "none",
                zIndex: 99,
              }}
            >
              Protected by ResolveX
            </Box>
          </Box>
        </Split>
      ) : (
        <Box sx={{ px: 2 }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Error Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{assignment.notes}</Typography>
                  <Typography variant="body2">
                    Error: {assignment.errorDetails?.anomaly_type}
                  </Typography>
                  <Typography variant="body2">
                    Severity: {assignment.errorDetails?.severity}
                  </Typography>
                </CardContent>
              </Card>
            </AccordionDetails>
          </Accordion>

          <Alert severity="info" sx={{ mt: 3 }}>
            No code linked yet. Waiting for client to share GitHub repo access.
          </Alert>

          <AssignmentChat assignmentId={assignmentId} />
        </Box>
      )}
    </Box>
  );
};

export default AssignmentDetailPage;