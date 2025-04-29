import { useState } from "react";
import { motion } from "framer-motion";
import { FiChevronLeft, FiCheck, FiPlus } from "react-icons/fi";
import useEngineerStore from "../../../store/engineerStore.js";

const CareerSection = () => {
  const {
    formData,
    updateSection,
    completeSection,
    setCurrentSection,
    completedSections,
  } = useEngineerStore();

  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateSection("career", {
      ...formData.career,
      [name]: value,
    });
  };

  const validateSocialLink = (platform, url) => {
    if (!url) return true; // Skip validation if empty

    const patterns = {
      linkedin: /^(https?:\/\/)(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]{3,100}\/?$/i,
      github: /^(https?:\/\/)(www\.)?github\.com\/(?!\/)([\w-]+\/?)+$/i,
      twitter: /^(https?:\/\/)(www\.)?twitter\.com\/(?!\/)([\w-]+\/?)+$/i,
      portfolio: /^(https?:\/\/)(www\.)?[a-z0-9]+([-\.][a-z0-9]+)*\.[a-z]{2,5}(:\d{1,5})?(\/(?!\/)[\w-]+.*)?$/i,
    };
    
    
    return patterns[platform].test(url);
  };

  const handleSocialAccountChange = (platform, value) => {
    const isValid = validateSocialLink(platform, value);

    updateSection("career", {
      ...formData.career,
      socialAccounts: {
        ...formData.career.socialAccounts,
        [platform]: {
          value,
          isValid,
          error: isValid ? null : `Please enter a valid ${platform} URL`,
        },
      },
    });
  };

  const addSkill = () => {
    if (
      skillInput.trim() &&
      !formData.career.skills.includes(skillInput.trim())
    ) {
      updateSection("career", {
        ...formData.career,
        skills: [...formData.career.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    updateSection("career", {
      ...formData.career,
      skills: formData.career.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const validateAndProceed = () => {
    const newErrors = {};
    const {
      field,
      specialization,
      experience,
      skills,
      bio,
      intro,
      socialAccounts,
    } = formData.career;

    if (!field?.trim()) newErrors.field = "Field is required";
    if (!specialization?.trim())
      newErrors.specialization = "Specialization is required";
    if (!experience?.toString().trim())
      newErrors.experience = "Experience is required";
    if (!skills?.length) newErrors.skills = "At least one skill is required";
    if (!bio?.trim()) newErrors.bio = "Bio is required";
    if (!intro?.trim()) newErrors.intro = "Introduction is required";

    // Optional: check for invalid social accounts
    Object.entries(socialAccounts).forEach(([platform, data]) => {
      if (data?.value && data?.isValid === false) {
        newErrors[platform] = `${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } URL is invalid`;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      completeSection("career");
      setCurrentSection("education");
    } else {
      const firstError = Object.keys(newErrors)[0];
      document.getElementById(firstError)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const isFormComplete =
    formData.career.field?.trim() &&
    formData.career.specialization?.trim() &&
    formData.career.experience?.toString().trim() &&
    formData.career.skills?.length &&
    formData.career.bio?.trim() &&
    formData.career.intro?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="field">
            <label className="block text-sm font-medium text-gray-700">
              Field <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="field"
              value={formData.career.field}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.field ? "border-red-500" : ""
              }`}
            />
            {errors.field && (
              <p className="mt-1 text-sm text-red-600">{errors.field}</p>
            )}
          </div>

          <div id="specialization">
            <label className="block text-sm font-medium text-gray-700">
              Specialization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.career.specialization}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.specialization ? "border-red-500" : ""
              }`}
            />
            {errors.specialization && (
              <p className="mt-1 text-sm text-red-600">
                {errors.specialization}
              </p>
            )}
          </div>

          <div id="experience">
            <label className="block text-sm font-medium text-gray-700">
              Experience (years)
            </label>
            <input
              type="number"
              name="experience"
              value={formData.career.experience}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div id="skills">
            <label className="block text-sm font-medium text-gray-700">
              Skills
            </label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add skill and press Enter"
                className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus />
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {formData.career.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div id="bio">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.career.bio}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div id="intro">
          <label className="block text-sm font-medium text-gray-700">
            Introduction
          </label>
          <textarea
            name="intro"
            value={formData.career.intro}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Social Accounts
          </label>
          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  LinkedIn
                </label>
                <div className="mt-1 relative">
                  <input
                    type="url"
                    value={formData.career.socialAccounts.linkedin?.value || ""}
                    onChange={(e) =>
                      handleSocialAccountChange("linkedin", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/username"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formData.career.socialAccounts.linkedin?.isValid === false
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formData.career.socialAccounts.linkedin?.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {formData.career.socialAccounts.linkedin.error}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Github
                </label>
                <div className="mt-1 relative">
                  <input
                    type="url"
                    value={formData.career.socialAccounts.github?.value || ""}
                    onChange={(e) =>
                      handleSocialAccountChange("github", e.target.value)
                    }
                    placeholder="https://github.com/username"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formData.career.socialAccounts.github?.isValid === false
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formData.career.socialAccounts.github?.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {formData.career.socialAccounts.github.error}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Twitter
                </label>
                <div className="mt-1 relative">
                  <input
                    type="url"
                    value={formData.career.socialAccounts.twitter?.value || ""}
                    onChange={(e) =>
                      handleSocialAccountChange("twitter", e.target.value)
                    }
                    placeholder="https://twitter.com/username"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      formData.career.socialAccounts.twitter?.isValid === false
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formData.career.socialAccounts.twitter?.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {formData.career.socialAccounts.twitter.error}
                    </p>
                  )}
                </div>
              </div>
              <label className="block text-xs font-medium text-gray-500">
                Portfolio
              </label>
              <input
                type="url"
                value={formData.career.socialAccounts.portfolio || ""}
                onChange={(e) =>
                  handleSocialAccountChange("portfolio", e.target.value)
                }
                placeholder="https://yourportfolio.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
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
          onClick={validateAndProceed}
          className={`px-6 py-2 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center ${
            isFormComplete
              ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isFormComplete}
        >
          Save & Continue
          <FiCheck className="ml-2" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CareerSection;
