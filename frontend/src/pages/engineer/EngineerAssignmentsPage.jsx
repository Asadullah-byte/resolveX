// pages/engineer/EngineerAssignmentsPage.jsx
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
  } from "@mui/material";
  import { useEffect, useState } from "react";
  import useEngineerStore from "../../store/engineerStore";
  import { useNavigate } from "react-router-dom";
  
  const statusColors = {
    PENDING: "warning",
    IN_PROGRESS: "info",
    RESOLVED: "success",
  };
  
  const EngineerAssignmentsPage = () => {
    const { fetchMyAssignments, loading } = useEngineerStore();
    const [assignments, setAssignments] = useState([]);
    const navigate = useNavigate();
  
    useEffect(() => {
      const load = async () => {
        const res = await fetchMyAssignments();
        if (res?.assignments) setAssignments(res.assignments);
      };
      load();
    }, []);
  
    if (loading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
  
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
          Your Assigned Errors
        </Typography>
  
        {assignments.length === 0 ? (
          <Typography align="center">No assignments yet.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Error</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell>{a.errorDetails?.anomaly_type}</TableCell>
                    <TableCell>{a.fileName}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.status}
                        color={statusColors[a.status] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{a.fileDetails?.systemType || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(a.fileDetails?.analysisDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
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
      </Box>
    );
  };
  
  export default EngineerAssignmentsPage;
  