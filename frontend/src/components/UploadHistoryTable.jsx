import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorIcon from "@mui/icons-material/Error";
import useClientStore from "../store/clientStore";

const UploadHistoryTable = () => {
  const { uploadedFiles, fetchUploadedFiles, loading, error } = useClientStore();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    fetchUploadedFiles(); // Fetch updated AI analysis status
  }, []);

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setAiAnalysis(file.groqResponse || null);
    setOpen(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <TableContainer
        sx={{
          maxWidth: "82rem",
          marginX: "52px",
          marginTop: "30px",
          borderRadius: "8px",
          border: "2px solid #DEE1E6",
          marginBottom: "20px",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center" }}><b>File Name</b></TableCell>
              <TableCell sx={{ textAlign: "center" }}><b>Status</b></TableCell>
              <TableCell sx={{ textAlign: "center" }}><b>Upload Time</b></TableCell>
              <TableCell sx={{ textAlign: "center" }}><b>Uploader</b></TableCell>
              <TableCell sx={{ textAlign: "center" }}><b>AI Analysis</b></TableCell>
              <TableCell sx={{ textAlign: "center" }}><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedFiles.map((file, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: "center" }}>{file.fileName}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {file.status === "Processing" ? (
                    <HourglassEmptyIcon color="warning" />
                  ) : file.status === "Queued" ? (
                    <Typography color="gray">Queued</Typography>
                  ) : file.status === "Analyzed" ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                  {file.status}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {new Date(file.createdAt).toLocaleString()}
                </TableCell>
                <TableCell sx={{ display: "flex", justifyContent: "center" }}>
                  <Avatar src={`https://i.pravatar.cc/40?img=${index + 1}`} />
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {file.status === "Analyzed" && file.groqResponse ? (
                    <Typography color="primary">
                      {file.groqResponse.analysis_summary.anomalies_detected} anomalies detected
                    </Typography>
                  ) : (
                    <Typography color="gray">Waiting...</Typography>
                  )}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: "85px",
                      maxHeight: "40px",
                      borderRadius: "8px",
                      backgroundColor: file.status === "Analyzed" ? "#636AE8" : "#B0B0B0",
                    }}
                    onClick={() => handleViewFile(file)}
                    disabled={file.status !== "Analyzed"}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* AI Analysis Report Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>AI Analysis Report for {selectedFile?.fileName}</DialogTitle>
        <DialogContent dividers>
          {aiAnalysis ? (
            <>
              <Typography><b>System Type:</b> {aiAnalysis.analysis_summary.system_type}</Typography>
              <Typography><b>Total Log Entries:</b> {aiAnalysis.analysis_summary.total_log_entries}</Typography>
              <Typography><b>Errors Detected:</b> {aiAnalysis.analysis_summary.error_count}</Typography>
              <Typography><b>Warnings:</b> {aiAnalysis.analysis_summary.warning_count}</Typography>
              <Typography><b>Info Messages:</b> {aiAnalysis.analysis_summary.info_count}</Typography>
              <Typography><b>Timestamp:</b> {aiAnalysis.timestamp}</Typography>

              <Typography sx={{ marginTop: "15px" }}><b>Anomalies:</b></Typography>
              {aiAnalysis.anomalies.length > 0 ? (
                aiAnalysis.anomalies.map((anomaly, idx) => (
                  <div key={idx} style={{ paddingLeft: "10px", marginBottom: "10px" }}>
                    <Typography>- <b>Log Entry:</b> {anomaly.log_entry}</Typography>
                    <Typography>- <b>Severity:</b> {anomaly.severity}</Typography>
                    <Typography>- <b>Domain:</b> {anomaly.domain}</Typography>
                    <Typography>- <b>Suggested Action:</b> {anomaly.suggested_action}</Typography>
                  </div>
                ))
              ) : (
                <Typography>No anomalies detected.</Typography>
              )}
            </>
          ) : (
            <Typography>AI analysis not available for this file.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="outlined" color="error">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadHistoryTable;
