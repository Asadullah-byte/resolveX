// Enhanced /assignments page with refined UI in a single table view
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Avatar,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import useClientStore from "../../store/clientStore.js";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";

const statusColors = {
  Pending: "warning",
  Resolved: "success",
  "In Progress": "info",
};

const AssignmentsPage = () => {
  const { fetchErrorAssignments, loading, error } = useClientStore();
  const [assignments, setAssignments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const res = await fetchErrorAssignments();
      if (res?.assignments) setAssignments(res.assignments);
    };
    load();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" mt={4}>
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Engineer Assignment and Tracking
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, color: "text.secondary" }}>
        Manage assignments of errors to engineers with real-time tracking.
      </Typography>

      {assignments.length === 0 ? (
        <Typography align="center">No assignments found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Error ID</strong></TableCell>
                <TableCell><strong>Assigned Engineer</strong></TableCell>
                <TableCell><strong>Total Time Waiting</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assign, i) => (
                <TableRow key={i}>
                  <TableCell>{assign.notes || assign.errorId}</TableCell>

                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar src={assign.engineer?.profilePic} sx={{ bgcolor: "#4f46e5", width: 32, height: 32 }}>
                        {assign.engineer?.name?.[0] || <PersonIcon fontSize="small" />}
                      </Avatar>
                      <Typography variant="body2">
                        {assign.engineer?.name || "N/A"}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>{assign.timeWaiting || "-"}</TableCell>

                  <TableCell>
                    <Chip
                      label={assign.status}
                      color={statusColors[assign.status] || "default"}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={assign.progress || 0}
                      sx={{ height: 8, borderRadius: 5, width: 120 }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      onClick={() => navigate(`/assignment/${assign._id}`)}
                      variant="contained"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-start" sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" startIcon={<PersonIcon />}>
          Assign
        </Button>
        <Button variant="outlined" color="primary">
          Update
        </Button>
      </Stack>
    </Box>
  );
};

export default AssignmentsPage;
