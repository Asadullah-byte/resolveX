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
import useClientStore from "../store/clientStore";

const UploadHistoryTable = () => {
  const { uploadedFiles, fetchUploadedFiles, loading, error } = useClientStore();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const handleViewFile = async (file) => {
    setSelectedFile(file);
    setOpen(true);

    if (file.name.endsWith(".txt") || file.name.endsWith(".json") || file.name.endsWith(".log")) {
      try {
        const response = await fetch(file.url);
        const text = await response.text();
        setFileContent(text);
      } catch (error) {
        setFileContent("Failed to load file content.");
      }
    } else {
      setFileContent(null);
    }
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
              <TableCell sx={{ textAlign: "center" }}><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedFiles.map((file, index) => (
              <TableRow key={index}>
                <TableCell sx={{ textAlign: "center" }}>{file.name}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <CheckCircleIcon color="success" /> {file.status}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {new Date(file.uploadTime).toLocaleString()}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Avatar src={`https://i.pravatar.cc/40?img=${index + 1}`} />
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    sx={{
                      minWidth: "85px",
                      maxHeight: "40px",
                      borderRadius: "8px",
                      backgroundColor: "#636AE8",
                    }}
                    onClick={() => handleViewFile(file)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* File Preview Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>File Preview: {selectedFile?.name}</DialogTitle>
        <DialogContent dividers>
          {fileContent ? (
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                backgroundColor: "#f4f4f4",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              {fileContent}
            </Typography>
          ) : (
            <Typography>Cannot preview this file type. Please download it.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">Close</Button>
          <Button
            component="a"
            href={selectedFile?.url}
            download
            color="primary"
            variant="contained"
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadHistoryTable;
