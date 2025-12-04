import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Stack
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentChat from "../../components/AssignmentChat";
import useClientStore from "../../store/clientStore.js";
import useEngineerStore from "../../store/engineerStore.js";
import useVideoCall from "../../hooks/useVideoCall.js";
import { useAuthStore } from "../../store/authStore";
import Split from "react-split";

const AssignmentDetailPage = () => {
  const { assignmentId } = useParams();
  const { user } = useAuthStore();
  const engineerStore = useEngineerStore();
  const clientStore = useClientStore();
  const fetchAssignments = user.role === "Engineer" ? engineerStore.fetchMyAssignments : clientStore.fetchErrorAssignments;
  const updateAssignmentStatus = user.role === "Engineer" ? engineerStore.updateAssignmentStatus : clientStore.updateAssignmentStatus;

  const [assignment, setAssignment] = useState(null);
  const [callActive, setCallActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef();
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

  const handleStatusChange = async (status) => {
    const res = await updateAssignmentStatus(assignment._id, status);
    if (res?.assignment?.status === status) {
      setAssignment((prev) => ({ ...prev, status }));
    }
  };

  const handleStartProject = () => {
    if (!assignment.repoLinked) return;
    setStartTime(Date.now());
    handleStatusChange("IN_PROGRESS");
  };

  const handleEndProject = () => {
    clearInterval(timerRef.current);
    handleStatusChange("RESOLVED");
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

  if (!assignment) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>Assignment Details</Typography>

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {user.role === "Client" && !assignment.repoLinked && (
            <Button
              onClick={() => window.location.href = `http://localhost:3003/auth/github?assignmentId=${assignment._id}`}
              variant="outlined"
              color="primary"
            >
              Link GitHub Repo
            </Button>
          )}

          {user.role === "Client" && assignment.repoLinked && (
            <Button onClick={handleRevokeAccess} variant="outlined" color="error">
              Revoke GitHub Access
            </Button>
          )}

          {user.role === "Engineer" && assignment.status === "PENDING" && assignment.repoLinked && (
            <Button variant="contained" color="success" onClick={handleStartProject}>
              Start Project
            </Button>
          )}

          {user.role === "Engineer" && assignment.status === "IN_PROGRESS" && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button variant="contained" color="secondary" onClick={handleEndProject}>End Project</Button>
              <Typography variant="body2">Elapsed: {formatTime(elapsed)}</Typography>
            </Stack>
          )}

          <Chip
            label={`Status: ${assignment.status}`}
            color={assignment.status === "PENDING" ? "warning" : assignment.status === "IN_PROGRESS" ? "info" : "success"}
          />
        </Stack>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {assignment.repoLinked && assignment.repoUrl ? (
          <Split
            className="split"
            style={{ display: 'flex', height: '100%' }}
            sizes={[50, 50]}
            minSize={300}
            gutterSize={10}
            direction="horizontal"
            cursor="col-resize"
          >
            <Box sx={{ p: 2, overflowY: 'auto' }}>
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Error Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography fontWeight={600}>{assignment.notes}</Typography>
                  <Typography variant="body2">Error: {assignment.errorDetails?.anomaly_type}</Typography>
                  <Typography variant="body2">Severity: {assignment.errorDetails?.severity}</Typography>
                </AccordionDetails>
              </Accordion>
              <AssignmentChat assignmentId={assignmentId} />
            </Box>

            <Box sx={{ position: 'relative', height: '100%', backgroundColor: '#000' }}>
              <iframe
                src={`https://codesandbox.io/embed/github/${assignment.repoUrl}/tree/main/${assignment.repoFolder || ""}?codemirror=1&view=editor&theme=dark`}
                style={{ width: "100%", height: "100%", border: 0 }}
                allow="accelerometer; camera; microphone; clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Code Editor"
              />
              <Box sx={{ position: "absolute", bottom: 10, right: 10, color: "white", opacity: 0.3 }}>Protected by ResolveX</Box>
            </Box>
          </Split>
        ) : (
          <Box sx={{ p: 2, overflowY: 'auto', height: '100%' }}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Error Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography fontWeight={600}>{assignment.notes}</Typography>
                <Typography variant="body2">Error: {assignment.errorDetails?.anomaly_type}</Typography>
                <Typography variant="body2">Severity: {assignment.errorDetails?.severity}</Typography>
              </AccordionDetails>
            </Accordion>

            <Alert severity="info" sx={{ mt: 2 }}>
              No code linked yet. Waiting for client to share GitHub repo access.
            </Alert>

            <AssignmentChat assignmentId={assignmentId} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AssignmentDetailPage;
