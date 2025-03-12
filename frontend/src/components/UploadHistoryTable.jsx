import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

const files = [
  {
    name: "log_file_1.log",
    status: "Completed",
    icon: <CheckCircleIcon color="success" />,
    action: "View",
    uploader: "https://i.pravatar.cc/40?img=1",
  },
  {
    name: "error_log_2.txt",
    status: "Failed",
    icon: <ErrorIcon color="error" />,
    action: "Retry",
    uploader: "https://i.pravatar.cc/40?img=2",
  },
  {
    name: "system_log_3.log",
    status: "Completed",
    icon: <CheckCircleIcon color="success" />,
    action: "View",
    uploader: "https://i.pravatar.cc/40?img=3",
  },
  {
    name: "debug_log_4.txt",
    status: "In Progress",
    icon: <HourglassEmptyIcon color="warning" />,
    action: "Cancel",
    uploader: "https://i.pravatar.cc/40?img=4",
  },
];

const UploadHistoryTable = () => {
  return (
    <TableContainer sx={{ maxWidth:"82rem", marginX: "52px", marginTop:"30px", display: "flex", justifyContent: "center" ,alignItems: "center" ,borderRadius: "8px", border: "2px solid #DEE1E6", }}>
      <Table >
        <TableHead >
          <TableRow >
            <TableCell sx={{ padding: "10px" , borderBottom: "1px solid #DEE1E6", textAlign: "center"}}>
              <b>File Name</b>
            </TableCell>
            <TableCell sx={{ padding: "10px",borderBottom: "1px solid #DEE1E6", textAlign: "center" }}>
              <b>Status</b>
            </TableCell>
            <TableCell sx={{ padding: "10px",borderBottom: "1px solid #DEE1E6", textAlign: "center" }}>
              <b>Notification</b>
            </TableCell>
            <TableCell sx={{ padding: "10px" ,borderBottom: "1px solid #DEE1E6", textAlign: "center"}}>
              <b>Upload Time</b>
            </TableCell>
            <TableCell sx={{ padding: "10px" ,borderBottom: "1px solid #DEE1E6", textAlign: "center"}}>
              <b>Uploader</b>
            </TableCell>
            <TableCell sx={{ padding: "10px" ,borderBottom: "1px solid #DEE1E6", textAlign: "center"}}>
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={index}>
              <TableCell sx={{ padding: "10px" ,borderBottom: "none", textAlign: "center"}}>{file.name}</TableCell>
              <TableCell sx={{ padding: "10px" ,borderBottom: "none", textAlign: "center"}}>
                {file.icon} {file.status}
              </TableCell>
              <TableCell sx={{ padding: "10px" ,borderBottom: "none", textAlign: "center"}}>
                <NotificationsNoneIcon />
              </TableCell>
              <TableCell sx={{ padding: "10px" ,borderBottom: "none", textAlign: "center"}}>⭐⭐⭐⭐⭐</TableCell>
              <TableCell sx={{ padding: "10px" ,borderBottom: "none", textAlign: "center"}}>
                <Avatar src={file.uploader} />
              </TableCell>
              <TableCell sx={{ padding: "10px" ,borderBottom: "none", textAlign: "center"}}>
                <Button variant="contained" sx={{minWidth: "85px", maxHeight:"40px", borderRadius:"8px", backgroundColor:"#636AE8"}}>{file.action}</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UploadHistoryTable;
