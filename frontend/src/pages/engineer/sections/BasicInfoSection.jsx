    import { useState } from "react";
    import { motion } from "framer-motion";
    import { FiUpload, FiCheck, FiUser } from "react-icons/fi";
    import useEngineerStore from "../../../store/engineerStore.js";
 
 

    const BasicInfoSection = () => {
    const {
        profile,
        formData,
        updateSection,
        completeSection,
        completedSections,
        setCurrentSection,
    } = useEngineerStore();

    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateSection("basic", {
        ...formData.basic,
        [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        if (e.target.name === "profilePic") {
            const reader = new FileReader();
            reader.onloadend = () => {
            setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }

        updateSection("basic", {
            ...formData.basic,
            [e.target.name]: file,
        });
        }
    };

    const validateAndProceed = () => {
        const newErrors = {};
        const { gender, country, state, city, dob, phoneNo } = formData.basic;

        if (!gender) newErrors.gender = "Gender is required";
        if (!country) newErrors.country = "Country is required";
        if (!state) newErrors.state = "State is required";
        if (!city) newErrors.city = "City is required";
        if (!dob) newErrors.dob = "Date of birth is required";
        if (!phoneNo) newErrors.phoneNo = "Phone number is required";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
        completeSection("basic");
        setCurrentSection("career");
        } else {
        // Scroll to first error
        const firstError = Object.keys(newErrors)[0];
        document.getElementById(firstError)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
        }
    };

    return (
        <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Non-editable user info */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
                Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700">
                    First Name
                </label>
                <input
                    type="text"
                    value={profile?.user.fname || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed"
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">
                    Last Name
                </label>
                <input
                    type="text"
                    value={profile?.user.lname || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed"
                />
                </div>
                <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    value={profile?.user.email || ""}
                    readOnly
                    className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed"
                />
                </div>
            </div>
            </div>

            {/* Editable fields */}
            <div id="gender">
            <label className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
            </label>
            <select
                name="gender"
                value={formData.basic.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
            </select>
            </div>

            <div id="dob">
            <label className="block text-sm font-medium text-gray-700">
                Date of Birth
            </label>
            <input
                type="date"
                name="dob"
                value={formData.basic.dob}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            </div>

            <div id="country">
            <label className="block text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="country"
                value={formData.basic.country}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.country ? "border-red-500" : ""
                }`}
            />
            {errors.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
            </div>

            <div id="state">
            <label className="block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="state"
                value={formData.basic.state}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.state ? "border-red-500" : ""
                }`}
            />
            {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
            </div>

            <div id="city">
            <label className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="city"
                value={formData.basic.city}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.city ? "border-red-500" : ""
                }`}
            />
            {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
            </div>

            <div id="phoneNo">
            <label className="block text-sm font-medium text-gray-700">
                Phone Number
            </label>
            <input
                type="tel"
                name="phoneNo"
                value={formData.basic.phoneNo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            </div>

            <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
                Profile Picture
            </label>
            <div className="mt-1 flex items-center">
                <div className="mr-4">
                {previewImage || formData.basic.profilePic ? (
                    <img
                    src={previewImage || formData.basic.profilePic}
                    alt="Profile preview"
                    className="h-16 w-16 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiUser className="text-gray-400" />
                    </div>
                )}
                </div>
                <label className="cursor-pointer">
                <div className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
                    <FiUpload className="mr-2" />
                    Upload
                </div>
                <input
                    type="file"
                    name="profilePic"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                />
                </label>
            </div>
            </div>

            <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
                Resume
            </label>
            <div className="mt-1 flex items-center">
                {formData.basic.resume &&
                typeof formData.basic.resume === "string" ? (
                <a
                    href={formData.basic.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mr-4"
                >
                    View Current Resume
                </a>
                ) : null}
                <label className="cursor-pointer">
                <div className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
                    <FiUpload className="mr-2" />
                    {formData.basic.resume ? "Change Resume" : "Upload Resume"}
                </div>
                <input
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="sr-only"
                />
                </label>
            </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={validateAndProceed}
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

    export default BasicInfoSection;
