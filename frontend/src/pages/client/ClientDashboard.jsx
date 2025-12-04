// Update your ClientDashboard.jsx with these changes
import  { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import useClientStore from '../../store/clientStore.js';
import { motion } from 'framer-motion';

const COLORS = ['#FF5733', '#FFC300', '#2ECC71']; // Red, Yellow, Green

const ClientDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    dashboardData,
    fetchDashboardAnalytics,
    loading,
    error
  } = useClientStore();

  useEffect(() => {
    fetchDashboardAnalytics();
  }, []);

  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) return null;

  // Prepare data for charts
  const severityData = Object.entries(dashboardData.overallStats.severityDistribution).map(
    ([name, value]) => ({ name, value })
  );

  const errorTypeData = Object.entries(dashboardData.overallStats.errorTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const fileComparisonData = dashboardData.fileAnalytics.map(file => ({
    name: file.fileName,
    high: file.severityCounts.high,
    medium: file.severityCounts.medium,
    low: file.severityCounts.low
  }));

  return (
   <div className= "w-full h-full bg-white">
    <Box p={isMobile ? 2 : 4} maxWidth="100%" margin="auto"> {/* Reduced width */}
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
    Error Analytics Overview
    </Typography>

       {/* Overview Cards */}
       <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "transparent", border: "2px solid #DEDCDC", borderRadius: "6px" }}>
            <CardContent>
              <Typography color="textSecondary">Total Files</Typography>
              <Typography variant="h4">
                {dashboardData.overallStats.totalFiles}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "transparent", border: "2px solid #DEDCDC", borderRadius: "6px" }}>
            <CardContent>
              <Typography color="textSecondary">Total Errors</Typography>
              <Typography variant="h4">
                {dashboardData.overallStats.totalErrors}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "transparent", border: "2px solid #DEDCDC", borderRadius: "6px" }}>
            <CardContent>
              <Typography color="textSecondary">Critical Errors</Typography>
              <Typography variant="h4" color="error">
                {dashboardData.overallStats.severityDistribution.high}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "transparent", border: "2px solid #DEDCDC", borderRadius: "6px" }}>
            <CardContent>
              <Typography color="textSecondary">Avg Errors/File</Typography>
              <Typography variant="h4">
                {(dashboardData.overallStats.totalErrors / dashboardData.overallStats.totalFiles).toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Main Charts */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
      Total Errors Detected
    </Typography>
      <Grid container spacing={3}>
        
        {/* Severity Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ backgroundColor: "transparent", border: "2px solid #DEDCDC", borderRadius: "12px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Error Severity Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "6px" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Error Types Bar Chart */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ backgroundColor: "transparent", border: "2px solid #DEDCDC", borderRadius: "12px" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Error Types
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={errorTypeData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 0,
                    }}
                    barGap={0} // No extra space between bars
                    barCategoryGap={5} // Reduce category gap
                  >
                    {/* Removed CartesianGrid to remove dotted lines */}
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: "6px" }} 
                     wrapperStyle={{ backgroundColor: "transparent" }}
                     cursor={{ fill: "transparent" }} 
                    />
                    <Legend  />
                    <Bar 
                      dataKey="value" 
                      fill="#8884d8" 
                      name="Error Count"
                      radius={[4, 4, 0, 0]} // Rounded corners
                      barSize={40} // Thin bars
                      
                    >
                      
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* File Comparison Chart - Updated with side-by-side bars */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card sx={{ backgroundColor: "transparent", border: "2px solid #DEDCDC", borderRadius: "12px",  height:"25em" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Error Comparison by File
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart
                    data={fileComparisonData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                    barGap={8}
                    barCategoryGap={20}
                  >
                    {/* Removed CartesianGrid to remove dotted lines */}
                    <XAxis 
                      dataKey="name" 
                      angle={0} // Horizontal labels
                      textAnchor="middle"
                      height={70}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      
                    />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: "6px" }}/>
                    <Legend />
                    <Bar 
                      dataKey="medium" 
                      fill="#FFC300" 
                      name="Medium" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                    <Bar 
                      dataKey="high" 
                      fill="#FF5733" 
                      name="Critical" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                    <Bar 
                      dataKey="low" 
                      fill="#2ECC71" 
                      name="Low" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
    </div>
  );
};

export default ClientDashboard;