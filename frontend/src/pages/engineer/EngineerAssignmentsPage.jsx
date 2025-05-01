import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  useMediaQuery,
  Stack,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import useEngineerStore from "../../store/engineerStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AssignmentIcon from "@mui/icons-material/Assignment";

const statusColors = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

const EngineerAssignmentsPage = () => {
  const { fetchMyAssignments, loading } = useEngineerStore();
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const loadAssignments = async () => {
    try {
      setError(false);
      const res = await fetchMyAssignments();
      if (res?.assignments) {
        setAssignments(res.assignments);
      } else {
        throw new Error("No data");
      }
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const CardItem = ({ assignment }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {assignment.errorDetails?.anomaly_type ?? "Unknown Error"}
          </Typography>
          <Divider />
          <Typography variant="body2">File: {assignment.fileName}</Typography>
          <Typography variant="body2">
            System: {assignment.fileDetails?.systemType ?? "N/A"}
          </Typography>
          <Typography variant="body2">
            Date:{" "}
            {assignment.fileDetails?.analysisDate
              ? new Date(assignment.fileDetails.analysisDate).toLocaleDateString()
              : "N/A"}
          </Typography>
          <Chip
            label={assignment.status}
            color={statusColors[assignment.status] || "default"}
            size="small"
            sx={{ width: "fit-content" }}
          />
          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/assignment/${assignment._id}`)}
            >
              View
            </Button>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: { xs: 2, sm: 4 },
        minHeight: "100vh",
        
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 4 }}>
        <AssignmentIcon sx={{ color: "#4f46e5" }} fontSize="large" />
        <Typography variant="h5" fontWeight={600}>
          Engineer Assignment Tracker
        </Typography>
      </Stack>

      {/* Error Fallback */}
      {error && (
        <Stack alignItems="center" spacing={2} mt={5}>
          <Typography color="error">Failed to load assignments.</Typography>
          <Button variant="contained" onClick={loadAssignments}>
            Retry
          </Button>
        </Stack>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* No Assignments */}
      {!loading && !error && assignments.length === 0 && (
        <Typography variant="h6" align="center" sx={{ mt: 6 }}>
          🎉 No assignments yet. You're all clear!
        </Typography>
      )}

      {/* Desktop Table View */}
      {!loading && !error && !isMobile && assignments.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Error</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>System</TableCell>
                <TableCell>Assigned</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((a) => (
                <TableRow
                  key={a._id}
                  hover
                  sx={{
                    transition: "background 0.2s",
                    "&:hover": { backgroundColor: "#f0f4ff" },
                  }}
                >
                  <TableCell>{a.errorDetails?.anomaly_type ?? "Unknown"}</TableCell>
                  <TableCell>{a.fileName}</TableCell>
                  <TableCell>
                    <Chip
                      label={a.status}
                      color={statusColors[a.status] || "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{a.fileDetails?.systemType || "N/A"}</TableCell>
                  <TableCell>
                    {a.fileDetails?.analysisDate
                      ? new Date(a.fileDetails.analysisDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => navigate(`/assignment/${a._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Mobile Card View */}
      {!loading && !error && isMobile && assignments.length > 0 && (
        <Box mt={2}>
          {assignments.map((assignment) => (
            <CardItem assignment={assignment} key={assignment._id} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EngineerAssignmentsPage;
