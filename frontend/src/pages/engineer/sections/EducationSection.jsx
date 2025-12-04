import { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import useEngineerStore from "../../../store/engineerStore.js";

const EducationSection = () => {
  const {
    formData,
    updateSection,
    submitProfile,
    setCurrentSection,
    completeSection,
    completedSections,
  } = useEngineerStore();

  const [errors, setErrors] = useState({});

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][field] = value;
    updateSection("education", updatedEducation);
  };

  const addEducation = () => {
    updateSection("education", [
      ...formData.education,
      {
        institute: "",
        type: "BACHELORS",
        major: "",
        degree: "",
        marks: "",
        grade: "",
        startYear: "",
        endYear: "",
      },
    ]);
  };

  const removeEducation = (index) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    updateSection("education", updatedEducation);
  };

  const validateAndSubmit = async () => {
    const newErrors = {};

    formData.education.forEach((edu, index) => {
      if (!edu.institute)
        newErrors[`institute-${index}`] = "Institute is required";
      if (!edu.degree) newErrors[`degree-${index}`] = "Degree is required";
      if (!edu.startYear)
        newErrors[`startYear-${index}`] = "Start year is required";
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const success = await submitProfile();
      if (success) {
        completeSection("education");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {formData.education.map((edu, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Education #{index + 1}
              </h3>
              {formData.education.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-800 flex items-center text-sm"
                >
                  <FiTrash2 className="mr-1" />
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Institute <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={edu.institute}
                  onChange={(e) =>
                    handleEducationChange(index, "institute", e.target.value)
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors[`institute-${index}`] ? "border-red-500" : ""
                  }`}
                />
                {errors[`institute-${index}`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`institute-${index}`]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Degree Type
                </label>
                <select
                  value={edu.type}
                  onChange={(e) =>
                    handleEducationChange(index, "type", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="BACHELORS">Bachelor&apos;s</option>
                  <option value="MASTERS">Master&apos;s</option>
                  <option value="PHD">PhD</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="CERTIFICATION">Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Major
                </label>
                <input
                  type="text"
                  value={edu.major}
                  onChange={(e) =>
                    handleEducationChange(index, "major", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Degree <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) =>
                    handleEducationChange(index, "degree", e.target.value)
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors[`degree-${index}`] ? "border-red-500" : ""
                  }`}
                />
                {errors[`degree-${index}`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`degree-${index}`]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marks/GPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={edu.marks}
                  onChange={(e) =>
                    handleEducationChange(index, "marks", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Grade
                </label>
                <input
                  type="text"
                  value={edu.grade}
                  onChange={(e) =>
                    handleEducationChange(index, "grade", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={edu.startYear}
                  onChange={(e) =>
                    handleEducationChange(index, "startYear", e.target.value)
                  }
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors[`startYear-${index}`] ? "border-red-500" : ""
                  }`}
                />
                {errors[`startYear-${index}`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`startYear-${index}`]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Year
                </label>
                <input
                  type="number"
                  value={edu.endYear}
                  onChange={(e) =>
                    handleEducationChange(index, "endYear", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={addEducation}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Another Education
        </motion.button>
      </div>

      <div className="mt-8 flex justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentSection("career")}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
        >
          <FiChevronLeft className="mr-2" />
          Back
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={validateAndSubmit}
          className={`px-6 py-2 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center ${
            formData.basic.gender &&
            formData.basic.country &&
            formData.basic.state &&
            formData.basic.city
              ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={
            !(
              formData.basic.gender &&
              formData.basic.country &&
              formData.basic.state &&
              formData.basic.city
            )
          }
        >
          Save & Continue
          <FiCheck className="ml-2" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EducationSection;
