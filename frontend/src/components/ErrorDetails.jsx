import React, { useState } from 'react';
import { 
  SyncProblem as AllErrorsIcon,
  Warning as MoreErrorsIcon,
  Error as CriticalIcon,
  ReportProblem as MediumIcon,
  Info as LowIcon,
  Storage as DatabaseIcon,
  Api as ApiIcon,
  Lock as SecurityIcon,
  Cloud as CloudIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Chip, 
  Button,
  Paper,
  Divider
} from '@mui/material';

const ErrorDetails = ({ fileName, errors, summary }) => {
  const [selectedError, setSelectedError] = useState(null);
  
  // Sample errors data if not provided
  const displayErrors = errors || [
    { 
      id: 1, 
      name: 'Data Sync Issue', 
      severity: 'Low', 
      domain: 'Database',
      details: 'Intermittent synchronization failures between primary and replica databases.',
      lastOccurred: '2 hours ago',
      frequency: '12 times'
    },
    { 
      id: 2, 
      name: 'API Timeout', 
      severity: 'Medium', 
      domain: 'API',
      details: 'External API calls are timing out after 30 seconds, causing transaction failures.',
      lastOccurred: '1 hour ago',
      frequency: '8 times'
    },
    { 
      id: 3, 
      name: 'Invalid Credentials', 
      severity: 'Critical', 
      domain: 'Security',
      details: 'Authentication service rejecting valid credentials due to misconfigured JWT validation.',
      lastOccurred: '30 minutes ago',
      frequency: '5 times'
    }
  ];

  // Engineers data
  const engineers = [
    {
      id: 1,
      name: 'John Smith',
      expertise: 'AI Systems',
      experience: '7 years',
      rate: '$50/hr',
      rating: 4.5,
      reviews: 12,
      description: 'Expert in AI and machine learning systems with extensive experience in debugging complex algorithms.',
      level: 'Senior',
      domains: ['ai', 'machine learning', 'data']
    },
    {
      id: 2,
      name: 'Emma Johnson',
      expertise: 'Cloud Solutions',
      experience: '5 years',
      rate: '$45/hr',
      rating: 4.7,
      reviews: 8,
      description: 'Specializes in cloud infrastructure and distributed systems with AWS and Azure certifications.',
      level: 'Mid-level',
      domains: ['cloud', 'api', 'database']
    },
    {
      id: 3,
      name: 'Mike Brown',
      expertise: 'Cybersecurity',
      experience: '10 years',
      rate: '$65/hr',
      rating: 4.9,
      reviews: 15,
      description: 'Security expert with a decade of experience in securing applications and infrastructure.',
      level: 'Senior',
      domains: ['security', 'auth', 'credentials']
    },
    {
      id: 4,
      name: 'Sarah Lee',
      expertise: 'Database Systems',
      experience: '3 years',
      rate: '$35/hr',
      rating: 4.2,
      reviews: 5,
      description: 'Junior database specialist with experience in SQL and NoSQL systems.',
      level: 'Junior',
      domains: ['database', 'data']
    },
    {
      id: 5,
      name: 'Alex Chen',
      expertise: 'API Development',
      experience: '4 years',
      rate: '$40/hr',
      rating: 4.3,
      reviews: 7,
      description: 'Mid-level API developer with experience in REST and GraphQL APIs.',
      level: 'Mid-level',
      domains: ['api', 'cloud']
    }
  ];

  // Get recommended engineers based on selected error
  const getRecommendedEngineers = (errorId) => {
    if (!errorId) return [];
    
    const error = displayErrors.find(e => e.id === errorId);
    if (!error) return [];
    
    const severityLevel = error.severity === 'Critical' ? 3 : 
                         error.severity === 'Medium' ? 2 : 1;
    const domain = error.domain.toLowerCase();
    
    return engineers.filter(eng => {
      const domainMatch = eng.domains.some(d => domain.includes(d.toLowerCase()));
      const levelMatch = 
        (severityLevel >= 3 && eng.level === 'Senior') ||
        (severityLevel === 2 && (eng.level === 'Mid-level' || eng.level === 'Senior')) ||
        (severityLevel <= 1 && (eng.level === 'Junior' || eng.level === 'Mid-level'));
      
      return domainMatch && levelMatch;
    }).sort((a, b) => b.rating - a.rating);
  };

  const getDomainIcon = (domain) => {
    const domainLower = domain.toLowerCase();
    if (domainLower.includes('api')) return <ApiIcon className="text-blue-500" />;
    if (domainLower.includes('database')) return <DatabaseIcon className="text-purple-500" />;
    if (domainLower.includes('security')) return <SecurityIcon className="text-red-500" />;
    if (domainLower.includes('cloud')) return <CloudIcon className="text-indigo-500" />;
    return <CodeIcon className="text-gray-500" />;
  };

  return (
    <Box className="h-screen flex flex-col">
      {/* Analytics Overview */}
      <Box className="p-6">
        <Typography variant="h4" className="text-gray-900 mb-4">
          Analytics Overview
        </Typography>
        
        <Box className="flex flex-wrap gap-4 mb-6">
          <Paper elevation={0} className="flex-1 min-w-[200px] p-4 border border-gray-200 rounded-lg">
            <Box className="flex items-center mb-2">
              <Box className="p-2 bg-red-50 rounded-lg mr-3">
                <AllErrorsIcon className="text-red-500" />
              </Box>
              <Typography variant="body2" className="text-gray-500">All Errors</Typography>
            </Box>
            <Box className="flex items-baseline">
              <Typography variant="h5" className="mr-2">1,234</Typography>
              <Typography variant="body2" className="text-red-500">5%</Typography>
            </Box>
          </Paper>
          {/* Other stat cards... */}
        </Box>
      </Box>

      <Divider />

      {/* Main content */}
      <Box className="flex-1 flex overflow-hidden">
        {/* Errors Section - 60% width */}
        <Box className="w-[60%] p-6 overflow-y-auto border-r border-gray-200">
          <Typography variant="h5" className="text-gray-900 mb-4">Detected Issues</Typography>
          
          <Box className="space-y-3">
            {displayErrors.map((error) => (
              <motion.div 
                key={error.id}
                layout
                className={`bg-white border ${selectedError === error.id ? 'border-indigo-300 shadow-sm' : 'border-gray-200'} rounded-lg cursor-pointer`}
                onClick={() => setSelectedError(selectedError === error.id ? null : error.id)}
              >
                <Box className="p-4">
                  <Box className="flex items-start">
                    <Box className="p-2 rounded-lg mr-4" style={{ 
                      backgroundColor: 
                        error.severity === 'Critical' ? '#FEE2E2' : 
                        error.severity === 'Medium' ? '#FEF3C7' : '#EFF6FF'
                    }}>
                      {getDomainIcon(error.domain)}
                    </Box>
                    <Box className="flex-1">
                      <Box className="flex justify-between items-start">
                        <Typography variant="subtitle1" className="font-medium">{error.name}</Typography>
                        <Chip 
                          label={error.severity}
                          size="small"
                          className={`${error.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                            error.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'}`}
                        />
                      </Box>
                      <Typography variant="body2" className="text-gray-500 mt-1">{error.domain}</Typography>
                    </Box>
                  </Box>

                  <AnimatePresence>
                    {selectedError === error.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Box className="mt-3 pt-3 border-t border-gray-100">
                          <Typography variant="body2" className="text-gray-700">{error.details}</Typography>
                          <Box className="mt-2 flex flex-wrap gap-2">
                            <Chip 
                              label={`Last occurred: ${error.lastOccurred}`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={`Frequency: ${error.frequency}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Engineers Section - 40% width */}
        <Box className="w-[40%] p-6 overflow-y-auto">
          <Typography variant="h5" className="text-gray-900 mb-4">
            {selectedError ? 'Recommended Experts' : 'Select an issue to see recommended experts'}
          </Typography>
          
          <AnimatePresence>
            {selectedError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {getRecommendedEngineers(selectedError).map((engineer) => (
                  <motion.div 
                    key={engineer.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <Box className="p-4">
                      <Box className="flex items-start">
                        <Box className="p-2 bg-indigo-50 rounded-lg mr-4">
                          <CodeIcon className="text-indigo-500" />
                        </Box>
                        <Box className="flex-1">
                          <Box className="flex justify-between items-start">
                            <Box>
                              <Typography variant="subtitle1" className="font-medium">{engineer.name}</Typography>
                              <Typography variant="body2" className="text-gray-500">{engineer.expertise}</Typography>
                            </Box>
                            <Typography variant="body2" className="text-gray-900 font-medium">{engineer.rate}</Typography>
                          </Box>
                          <Box className="mt-2">
                            <Box className="flex items-center text-sm text-gray-500">
                              <span>{engineer.experience} experience</span>
                              <span className="mx-2">•</span>
                              <Box className="flex items-center">
                                <span className="text-amber-500 font-medium mr-1">{engineer.rating}</span>
                                <span>({engineer.reviews} reviews)</span>
                              </Box>
                            </Box>
                            <Typography variant="body2" className="text-gray-700 mt-2">{engineer.description}</Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box className="mt-3 pt-3 border-t border-gray-100">
                        <Box className="flex justify-between items-center">
                          <Button 
                            variant="contained" 
                            color="primary"
                            size="small"
                          >
                            Assign
                          </Button>
                          <Box className="flex space-x-2">
                            <Button variant="outlined" size="small">
                              View Profile
                            </Button>
                            <Button variant="outlined" size="small">
                              Message
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default ErrorDetails;