import { motion } from 'framer-motion';

const ProgressStepper = ({ sections, currentSection, onSectionChange }) => {
  return (
    <div className="flex justify-between relative pb-8">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
        <motion.div
          className="absolute top-0 left-0 h-0.5 bg-blue-600"
          initial={{ width: '0%' }}
          animate={{
            width: `${((sections.findIndex(s => s.id === currentSection) + 1) / sections.length) * 100}%`
          }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {sections.map((section, index) => (
        <div key={section.id} className="relative z-10 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSectionChange(section.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              currentSection === section.id || section.completed
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          >
            {section.icon}
          </motion.button>
          <motion.span
            className={`mt-2 text-sm font-medium ${
              currentSection === section.id
                ? 'text-blue-600'
                : section.completed
                ? 'text-gray-600'
                : 'text-gray-400'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {section.label}
          </motion.span>
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;
