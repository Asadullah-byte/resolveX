import { useEffect } from 'react';
import useEngineerStore from '../../store/engineerStore.js';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import BasicInfoSection from './sections/BasicInfoSection.jsx';
import CareerSection from './sections/CareerSection.jsx';
import EducationSection from './sections/EducationSection.jsx';
import ProgressStepper from '../../components/ProgressStepper.jsx';
import { FiUser, FiBriefcase, FiBook } from 'react-icons/fi';

const EngineerProfile = () => {
  const {
    profile,
    loading,
    fetchProfile,
    currentSection,
    setCurrentSection,
    completedSections,
    loadLocalData,
  } = useEngineerStore();

  useEffect(() => {
    fetchProfile();
    loadLocalData();
  }, [fetchProfile, loadLocalData]);

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: <FiUser />, completed: completedSections.basic },
    { id: 'career', label: 'Career', icon: <FiBriefcase />, completed: completedSections.career },
    { id: 'education', label: 'Education', icon: <FiBook />, completed: completedSections.education },
  ];

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Engineer Profile
            </h1>
            
            <ProgressStepper 
              sections={sections} 
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
            />
            
            <div className="mt-8">
              {currentSection === 'basic' && <BasicInfoSection />}
              {currentSection === 'career' && <CareerSection />}
              {currentSection === 'education' && <EducationSection />}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EngineerProfile;