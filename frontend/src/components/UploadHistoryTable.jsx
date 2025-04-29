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
  CircularProgress,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorIcon from "@mui/icons-material/Error";
import useClientStore from "../store/clientStore";

const statusColors = {
  Processing: "warning",
  Queued: "default",
  Analyzed: "success",
  Failed: "error",
};

const statusIcons = {
  Processing: <HourglassEmptyIcon />,
  Queued: <HourglassEmptyIcon />,
  Analyzed: <CheckCircleIcon />,
  Failed: <ErrorIcon />,
};

const UploadHistoryTable = () => {
  const { uploadedFiles, fetchUploadedFiles, loading, error } = useClientStore();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUploadedFiles();
      } catch (err) {
        console.error("Failed to fetch upload history:", err);
      }
    };
    
    loadData();
    
    // Refresh data every 30 seconds for status updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [fetchUploadedFiles]);

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setAiAnalysis(file.groqResponse || null);
    setOpen(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <CircularProgress />
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center p-4">
      Error loading upload history: {error}
    </div>
  );

  return (
    <>
      <TableContainer
        sx={{
          borderRadius: "8px",
          border: "1.5px solid #DEE1E6",
          marginBottom: "20px",
          overflowX: "auto",
        }}
      >
        <Table aria-label="Upload history table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
              <TableCell sx={{ fontWeight: 600 }} align="center">File Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Upload Time</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Uploader</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">AI Analysis</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.fileName}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={statusIcons[file.status]}
                      label={file.status}
                      color={statusColors[file.status]}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {new Date(file.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Avatar 
                      src={`https://i.pravatar.cc/40?u=${file.uploaderId || index}`}
                      alt={`Uploader ${index}`}
                      sx={{ width: 32, height: 32, margin: 'auto' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {file.status === "Analyzed" && file.groqResponse ? (
                      <Typography color="primary" variant="body2">
                        {file.groqResponse.analysis_summary.anomalies_detected} anomalies
                      </Typography>
                    ) : (
                      <Typography color="textSecondary" variant="body2">
                        {file.status === "Failed" ? "Failed" : "Pending"}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        borderRadius: "8px",
                        backgroundColor: file.status === "Analyzed" ? "#6366F1" : "#E5E7EB",
                        color: file.status === "Analyzed" ? "white" : "#6B7280",
                        '&:hover': {
                          backgroundColor: file.status === "Analyzed" ? "#4F46E5" : "#D1D5DB",
                        }
                      }}
                      onClick={() => handleViewFile(file)}
                      disabled={file.status !== "Analyzed"}
                      aria-label={`View analysis for ${file.fileName}`}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No upload history available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* AI Analysis Report Modal */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        fullWidth 
        maxWidth="md"
        aria-labelledby="analysis-dialog-title"
      >
        <DialogTitle id="analysis-dialog-title">
          AI Analysis Report for {selectedFile?.fileName}
        </DialogTitle>
        <DialogContent dividers>
          {aiAnalysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="subtitle2">System Type</Typography>
                  <Typography>{aiAnalysis.analysis_summary.system_type}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Total Log Entries</Typography>
                  <Typography>{aiAnalysis.analysis_summary.total_log_entries}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Errors Detected</Typography>
                  <Typography color="error">{aiAnalysis.analysis_summary.error_count}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">Warnings</Typography>
                  <Typography color="warning">{aiAnalysis.analysis_summary.warning_count}</Typography>
                </div>
              </div>

              <div>
                <Typography variant="h6" gutterBottom>Anomalies Detected</Typography>
                {aiAnalysis.anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {aiAnalysis.anomalies.map((anomaly, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                        <Typography><strong>Log Entry:</strong> {anomaly.log_entry}</Typography>
                        <Typography><strong>Severity:</strong> 
                          <Chip 
                            label={anomaly.severity} 
                            size="small" 
                            sx={{ 
                              ml: 1,
                              backgroundColor: anomaly.severity === 'High' ? '#FEE2E2' : 
                                            anomaly.severity === 'Medium' ? '#FEF3C7' : '#DCFCE7',
                              color: anomaly.severity === 'High' ? '#B91C1C' :
                                     anomaly.severity === 'Medium' ? '#92400E' : '#166534'
                            }}
                          />
                        </Typography>
                        <Typography><strong>Suggested Action:</strong> {anomaly.suggested_action}</Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography color="textSecondary">No anomalies detected</Typography>
                )}
              </div>
            </div>
          ) : (
            <Typography color="textSecondary">AI analysis not available for this file.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpen(false)} 
            variant="outlined"
            color="inherit"
            aria-label="Close dialog"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadHistoryTable;