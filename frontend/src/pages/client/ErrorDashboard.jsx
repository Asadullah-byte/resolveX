import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Grid,
  Menu,
  MenuItem,
  Fade,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
  
  
} from "@mui/material";
import useClientStore from "../../store/clientStore.js";
import { motion, AnimatePresence } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore.js";
import axios from "axios";

// Custom theme colors
const customPalette = {
  primary: "#4f46e5", // Indigo
  secondary: "#10b981", // Emerald
  error: "#ef4444", // Red
  warning: "#f59e0b", // Amber
  info: "#3b82f6", // Blue
  success: "#10b981", // Emerald
  background: "#f9fafb", // Gray-50
  textPrimary: "#111827", // Gray-900
  textSecondary: "#6b7280", // Gray-500
  border: "#e5e7eb", // Gray-200
};

const API_URL = "http://localhost:3001/client";

const ErrorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    errorFilesList,
    fetchErrorFilesList,
    fileErrors,
    fetchFileErrors,
    loading,
    error,
    fetchEngineersByDomain,
    assignEngineer,
    engineers,
    fetchErrorAssignments,
    setLoading, 
  } = useClientStore();

  const [activeTab, setActiveTab] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [expandedErrors, setExpandedErrors] = useState({});
  const [recommendedExperts, setRecommendedExperts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedError, setSelectedError] = useState(null);

  

  // Add this useEffect to load assignments

  const openFilter = Boolean(filterAnchorEl);
  const isEngineerAssigned = (engineerId, error) => {
    if (!error || !assignments) return false;
    
    const errorId = `${error.anomaly_type}_${error.log_entry.substring(0, 10)}`;
    
    return assignments.some(assignment => 
      assignment.engineerId === engineerId && 
      assignment.errorId === errorId &&
      assignment.fileId === activeTab
    );
  };
  useEffect(() => {
    const loadAssignments = async () => {
      const experts = await fetchErrorAssignments();
      if (experts) {
        setAssignments(experts.assignments);
      }
    };
    loadAssignments();
  }, []);
  useEffect(() => {
    fetchErrorFilesList();
  }, []);

  useEffect(() => {
    if (errorFilesList.length > 0 && !activeTab) {
      setActiveTab(errorFilesList[0]._id);
    }
  }, [errorFilesList]);

  useEffect(() => {
    if (activeTab) {
      fetchFileErrors(activeTab);
    }
  }, [activeTab]);

  const filteredIssues =
    fileErrors?.errors?.filter(
      (issue) =>
        severityFilter === "all" ||
        issue.severity.toLowerCase() === severityFilter
    ) || [];

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (selectedFilter) => {
    setSeverityFilter(selectedFilter);
    setFilterAnchorEl(null);
  };

  const toggleErrorExpand = (errorId) => {
    setExpandedErrors((prev) => ({
      ...prev,
      [errorId]: !prev[errorId],
    }));
  };

  const getRecommendedExperts = async (errorDomain, severity) => {
    try {
      const result = await fetchEngineersByDomain(errorDomain, severity);

      // Transform the data if needed to match frontend expectations
      const formattedExperts =
        result?.internal?.map((expert) => ({
          ...expert,
          // Ensure all required fields are present
          fname: expert.fname || expert.user?.fname || "",
          lname: expert.lname || expert.user?.lname || "",
          skills: expert.skills || expert.career?.skills || [],
          experience: expert.experience || expert.career?.experience || 0,
          bio: expert.bio || expert.career?.bio || "",
        })) || [];

      return { internal: formattedExperts };
    } catch (err) {
      console.error("Error fetching engineers:", err);
      return { internal: [] };
    }
  };

  const handleErrorClick = async (error) => {
    const errorId = `${error.domain}_${error.log_entry.substring(0, 10)}`;
    toggleErrorExpand(errorId);
    setSelectedError(error); 
    try {
      setLoading(true);
      const result = await getRecommendedExperts(
        error.domain,
        error.severity
      );

      setRecommendedExperts(result?.internal || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendedExperts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEngineer = async (engineer, error) => {
    if (!error) {
      toast.error("No error details provided for assignment.");
      return;
    }

    setAssigning(true);
    try {
      const errorId = `${error.anomaly_type}_${error.log_entry.substring(
        0,
        10
      )}`;

      // Call the new MongoDB-based assignment endpoint
      const response = await axios.post(
        `${API_URL}/assign`,
        {
          engineerId: engineer.id || engineer.userId,
          fileId: activeTab, // The currently selected file ID
          errorId: errorId, // Our composite error identifier
          notes: `Assigned to fix ${error.anomaly_type} error`,
        },
        {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(`Engineer ${engineer.fname} assigned successfully!`);

        setAssignments(prev => [...prev, response.data.assignment]);  

        // Optional: Update UI to reflect assignment
        setRecommendedExperts((prev) =>
          prev.filter((ex) => ex.id !== engineer.id)
        
        );
        const result = await fetchErrorAssignments();
  if (result) {
    setAssignments(result.assignments);

        console.log("Assignment created:", response.data.assignment);
      } else {
        toast.error(response.data.message || "Assignment failed");
      }
    }} catch (err) {
      console.error("Error assigning engineer:", err);
      let errorMsg = "Failed to assign engineer. Please try again.";
      
      if (err.response) {
        if (err.response.status === 400) {
          errorMsg = err.response.data.message || "This error is already assigned";
        } else if (err.response.status === 404) {
          errorMsg = "File or error not found";
        }
      }
      
      toast.error(errorMsg);
    }
    finally {
      setAssigning(false);
    }
  };

  if (loading && !errorFilesList.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: customPalette.background,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: customPalette.primary }}
          />
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[1],
            }}
          >
            {error}
          </Alert>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: isMobile ? 2 : 4,
        backgroundColor: customPalette.background,
        transition: "all 0.3s ease",
      }}
    >
      {/* Header Section with Cards */}
      <Box
        sx={{
          mb: 6,
          maxWidth: "1400px",
          mx: "auto",
          transition: "all 0.3s ease",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 4,
              color: customPalette.textPrimary,
              fontSize: isMobile ? "1.75rem" : "2.125rem",
            }}
          >
            Analytics Overview
          </Typography>
        </motion.div>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: "System Type",
              value: fileErrors?.summary?.system_type || "Web Application",
              color: customPalette.primary,
            },
            {
              title: "Total Logs",
              value: fileErrors?.summary?.total_log_entries || 0,
              color: customPalette.info,
            },
            {
              title: "Errors",
              value: fileErrors?.summary?.error_count || 0,
              color: customPalette.error,
            },
            {
              title: "Last Scan",
              value: new Date(
                fileErrors?.analysisDate || new Date()
              ).toLocaleDateString(),
              color: customPalette.secondary,
            },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      color={customPalette.textSecondary}
                      sx={{ fontSize: "0.875rem", mb: 1 }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider
        sx={{
          my: 4,
          maxWidth: "1400px",
          mx: "auto",
          borderColor: customPalette.border,
        }}
      />

      {/* Main Content - 70/30 Split */}
      <Grid
        container
        spacing={3}
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          flexDirection: isMobile ? "column-reverse" : "row",
        }}
      >
        {/* Left Column - 70% width for Errors/Analytics */}
        <Grid item xs={12} md={8.4}>
          {/* File Chips Section */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": {
                height: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: customPalette.border,
                borderRadius: 3,
              },
            }}
          >
            {errorFilesList.map((file, index) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Chip
                  label={file.fileName}
                  variant={activeTab === file._id ? "filled" : "outlined"}
                  color={activeTab === file._id ? "primary" : "default"}
                  onClick={() => setActiveTab(file._id)}
                  onDelete={activeTab === file._id ? () => {} : undefined}
                  deleteIcon={<span className="ml-1">×</span>}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: theme.shadows[2],
                    },
                    fontWeight: activeTab === file._id ? 600 : 400,
                    backgroundColor:
                      activeTab === file._id
                        ? customPalette.primary
                        : "transparent",
                    color:
                      activeTab === file._id
                        ? "#fff"
                        : customPalette.textPrimary,
                    borderColor:
                      activeTab === file._id
                        ? customPalette.primary
                        : customPalette.border,
                  }}
                />
              </motion.div>
            ))}
          </Box>

          {/* Detected Issues Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: customPalette.border,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: customPalette.textPrimary,
                    }}
                  >
                    Detected Issues
                  </Typography>
                  <Box>
                    <Button
                      size="small"
                      onClick={handleFilterClick}
                      endIcon={
                        <motion.span
                          animate={{ rotate: openFilter ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ▾
                        </motion.span>
                      }
                      sx={{
                        textTransform: "capitalize",
                        color: customPalette.textPrimary,
                        "&:hover": {
                          backgroundColor: "rgba(79, 70, 229, 0.04)",
                        },
                      }}
                    >
                      {severityFilter === "all"
                        ? "All"
                        : severityFilter === "high"
                        ? "Critical"
                        : severityFilter.charAt(0).toUpperCase() +
                          severityFilter.slice(1)}
                    </Button>
                    <Menu
                      anchorEl={filterAnchorEl}
                      open={openFilter}
                      onClose={() => handleFilterClose(severityFilter)}
                      TransitionComponent={Fade}
                      PaperProps={{
                        sx: {
                          borderRadius: 2,
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          mt: 1,
                          minWidth: 120,
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => handleFilterClose("all")}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(79, 70, 229, 0.08)",
                          },
                        }}
                      >
                        All
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleFilterClose("high")}
                        sx={{
                          color: customPalette.error,
                          "&:hover": {
                            backgroundColor: "rgba(239, 68, 68, 0.08)",
                          },
                        }}
                      >
                        Critical
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleFilterClose("medium")}
                        sx={{
                          color: customPalette.warning,
                          "&:hover": {
                            backgroundColor: "rgba(245, 158, 11, 0.08)",
                          },
                        }}
                      >
                        Medium
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleFilterClose("low")}
                        sx={{
                          color: customPalette.success,
                          "&:hover": {
                            backgroundColor: "rgba(16, 185, 129, 0.08)",
                          },
                        }}
                      >
                        Low
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>

                <Box
                  sx={{
                    overflowY: "auto",
                    maxHeight: "500px",
                    overflowX: "hidden",
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: customPalette.border,
                      borderRadius: 3,
                    },
                  }}
                >
                  <AnimatePresence>
                    {filteredIssues.length > 0 ? (
                      filteredIssues.map((issue, index) => {
                        const errorId = `${
                          issue.anomaly_type
                        }_${issue.log_entry.substring(0, 10)}`;
                        const isExpanded = expandedErrors[errorId];

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            layout
                          >
                            <Card
                              variant="outlined"
                              sx={{
                                mb: 2,
                                borderRadius: 2,
                                borderLeft: `4px solid ${
                                  issue.severity.toLowerCase() === "high"
                                    ? customPalette.error
                                    : issue.severity.toLowerCase() === "medium"
                                    ? customPalette.warning
                                    : customPalette.success
                                }`,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  transform: "translateX(4px)",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => handleErrorClick(issue)}
                                >
                                  <Box>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        fontWeight: 500,
                                        color: customPalette.textPrimary,
                                      }}
                                    >
                                      {issue.anomaly_type}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mt: 0.5,
                                        color: customPalette.textSecondary,
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {issue.log_entry.length > 100
                                        ? `${issue.log_entry.substring(
                                            0,
                                            100
                                          )}...`
                                        : issue.log_entry}
                                    </Typography>
                                  </Box>
                                  <IconButton size="small">
                                    {isExpanded ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </IconButton>
                                </Box>

                                <Collapse in={isExpanded}>
                                  <Box
                                    sx={{
                                      mt: 2,
                                      pt: 2,
                                      borderTop: `1px solid ${customPalette.border}`,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 500,
                                        color: customPalette.textPrimary,
                                        mb: 1,
                                      }}
                                    >
                                      Error Details
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: customPalette.textSecondary,
                                        }}
                                      >
                                        Severity:
                                      </Typography>
                                      <Chip
                                        label={issue.severity}
                                        size="small"
                                        sx={{
                                          ml: 1,
                                          backgroundColor:
                                            issue.severity.toLowerCase() ===
                                            "high"
                                              ? "rgba(239, 68, 68, 0.1)"
                                              : issue.severity.toLowerCase() ===
                                                "medium"
                                              ? "rgba(245, 158, 11, 0.1)"
                                              : "rgba(16, 185, 129, 0.1)",
                                          color:
                                            issue.severity.toLowerCase() ===
                                            "high"
                                              ? customPalette.error
                                              : issue.severity.toLowerCase() ===
                                                "medium"
                                              ? customPalette.warning
                                              : customPalette.success,
                                        }}
                                      />
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: customPalette.textSecondary,
                                        mb: 2,
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {issue.log_entry}
                                    </Typography>
                                  </Box>
                                </Collapse>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            backgroundColor: "rgba(249, 250, 251, 0.5)",
                            borderColor: customPalette.border,
                          }}
                        >
                          <CardContent>
                            <Typography
                              variant="body1"
                              sx={{
                                color: customPalette.textSecondary,
                                textAlign: "center",
                                py: 2,
                              }}
                            >
                              No issues found with current filters
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right Column - 30% width for Engineer Recommendations */}
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              position: "sticky",
              top: isMobile ? 0 : 20,
              mb: isMobile ? 3 : 0,
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: customPalette?.textPrimary }}
                >
                  {recommendedExperts?.length > 0
                    ? "Recommended Experts"
                    : "Available Experts"}
                </Typography>
                <Button
                  size="small"
                  sx={{
                    color: customPalette?.primary,
                    "&:hover": { backgroundColor: "rgba(79, 70, 229, 0.04)" },
                  }}
                >
                  View all
                </Button>
              </Box>
              
                <AnimatePresence>
                  {/* Loading state */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={24} sx={{ mr: 2 }} />
                          <Typography variant="body2">
                            Finding experts...
                          </Typography>
                        </Box>
                      </Card>
                    </motion.div>
                  )}

                  {/* Recommended experts */}
                  {!loading &&
                    recommendedExperts?.length > 0 &&
                    recommendedExperts.map((expert, index) => (
                      <motion.div
                        key={expert.id || `expert-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        layout
                      >
                        <Card
                          variant="outlined"
                          sx={{
                            mb: 3,
                            borderRadius: 2,
                            borderColor: customPalette.border,
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            },
                          }}
                        >
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 500,
                                color: customPalette.textPrimary,
                                mb: 2,
                              }}
                            >
                              Recommended for{" "}
                              {error?.anomaly_type || "this issue"}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                              sx={{ mb: 2 }}
                            >
                              <Avatar
                                src={expert.profilePic}
                                sx={{
                                  bgcolor:
                                    expert.experience >= 5
                                      ? customPalette.error
                                      : expert.experience >= 2
                                      ? customPalette.warning
                                      : customPalette.success,
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                {expert.fname?.[0]}
                                {expert.lname?.[0]}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 600,
                                    color: customPalette.textPrimary,
                                  }}
                                >
                                  {expert.fname} {expert.lname}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: customPalette.textSecondary,
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    Internal Engineer
                                  </Typography>
                                  <Chip
                                    label={
                                      expert.experience >= 5
                                        ? "Senior"
                                        : expert.experience >= 2
                                        ? "Mid-level"
                                        : "Junior"
                                    }
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.65rem",
                                      backgroundColor:
                                        expert.experience >= 5
                                          ? "rgba(239, 68, 68, 0.1)"
                                          : expert.experience >= 2
                                          ? "rgba(245, 158, 11, 0.1)"
                                          : "rgba(16, 185, 129, 0.1)",
                                      color:
                                        expert.experience >= 5
                                          ? customPalette.error
                                          : expert.experience >= 2
                                          ? customPalette.warning
                                          : customPalette.success,
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Stack>

                            {/* Skills section */}
                            <Box sx={{ mb: 2 }}>
                              <Typography
                                variant="caption"
                                sx={{ color: customPalette.textSecondary }}
                              >
                                Top Skills:
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                  mt: 0.5,
                                }}
                              >
                                {expert.skills?.slice(0, 3).map((skill, i) => (
                                  <Chip
                                    key={i}
                                    label={skill}
                                    size="small"
                                    sx={{
                                      fontSize: "0.65rem",
                                      backgroundColor: "rgba(79, 70, 229, 0.1)",
                                      color: customPalette.primary,
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                color: customPalette.textSecondary,
                                mb: 3,
                                lineHeight: 1.5,
                              }}
                            >
                              {expert.bio ||
                                "Experienced professional in this domain"}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  handleAssignEngineer(expert, selectedError)
                                }
                                sx={{
                                  backgroundColor: customPalette.primary,
                                  textTransform: "none",
                                  borderRadius: 1,
                                  px: 2,
                                  py: 1,
                                  "&:hover": { backgroundColor: "#4338ca" },
                                }}
                              >
                                Assign
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}

                  {/* No recommendations state */}
                  {!loading &&
                    (!recommendedExperts ||
                      recommendedExperts.length === 0) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Card variant="outlined" sx={{ mb: 3 }}>
                          <CardContent>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              align="center"
                            >
                              No experts found for this error type
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                </AnimatePresence>
              
            </motion.div>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ErrorDashboard;
