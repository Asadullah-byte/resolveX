import { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import useEngineerStore from '../../store/engineerStore.js';
import { motion } from 'framer-motion';

const EngineerDashboard = () => {
  const { dashboardData, fetchDashboardData, loading } = useEngineerStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading || !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Engineer Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        {[
          { label: 'Total Assignments', value: dashboardData.totalAssignments },
          { label: 'In Progress', value: dashboardData.inProgress, color: 'info.main' },
          { label: 'Completed', value: dashboardData.completed, color: 'success.main' },
          { label: 'Pending', value: dashboardData.pending, color: 'warning.main' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card sx={{ backgroundColor: 'transparent', border: '2px solid #DEDCDC' }}>
                <CardContent>
                  <Typography color="textSecondary">{stat.label}</Typography>
                  <Typography variant="h4" color={stat.color || 'text.primary'}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EngineerDashboard;
