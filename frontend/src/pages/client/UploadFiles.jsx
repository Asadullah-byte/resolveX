import React, { useCallback } from "react";
import useClientStore from "../../store/clientStore.js";
import { UploadIcon, XIcon, FileTextIcon, FileCodeIcon, FileInputIcon } from "lucide-react";
import Button from "../../components/Button.jsx";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import UploadHistoryTable from "../../components/UploadHistoryTable.jsx";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

const UploadFiles = () => {
  const { user } = useAuthStore();
  const { file, response, error, loading, setFile, uploadFile } = useClientStore();
  
  // Authorization check
  if (!user || !user.role) {
    console.error("User role is not available!");
    return <Navigate to="/unauthorized" />;
  }
  
  const allowedRoles = ["Client", "Engineer"];
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" />;
  }

  const allowedFileTypes = [
    "text/plain",
    "application/json",
    "application/log",
  ];

  const fileTypeIcons = {
    "text/plain": <FileTextIcon className="text-blue-500" size={18} />,
    "application/json": <FileCodeIcon className="text-purple-500" size={18} />,
    "application/log": <FileInputIcon className="text-green-500" size={18} />,
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const validFiles = acceptedFiles.filter((file) =>
        allowedFileTypes.includes(file.type)
      );

      if (validFiles.length === 0) {
        toast.error("Only .log, .txt, .json files are allowed.");
        return;
      }

      if (validFiles.length > 5) {
        toast.error("You can upload a maximum of 5 files.");
        return;
      }

      setFile(validFiles);
      toast.success(`${validFiles.length} file(s) selected`);
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "text/plain": [".txt"],
      "application/json": [".json"],
      "application/log": [".log"],
    },
    multiple: true,
    maxFiles: 5,
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || file.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }
    try {
      await uploadFile();
      toast.success("Files uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 ml-13">
          <h1 className="text-3xl font-bold text-gray-900">Upload your logs</h1>
          <p className="mt-2 text-gray-600">
            resolveX supports .txt, .json, .log formats only
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 ml-13 mr-13">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleUpload} className="flex flex-col items-center">
              {/* Drag and Drop Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed p-5 w-150 rounded-lg mt-2.5 mb-4 transition cursor-pointer flex flex-col items-center justify-center ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                <input {...getInputProps()} aria-label="File upload" />
                <div className={`p-3 rounded-full mb-4 ${
                  isDragActive ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <UploadIcon
                    className={`${isDragActive ? "text-blue-600" : "text-gray-500"}`}
                    size={32}
                  />
                </div>
                <p className={`text-center text-lg ${
                  isDragActive ? "text-blue-600 font-medium" : "text-gray-600"
                }`}>
                  {isDragActive
                    ? "Drop the file here..."
                    : "Drag & Drop files here or click to upload"}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Max file size: 10MB each
                </p>
              </div>

              {/* Selected Files Preview */}
              {file && file.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 w-full justify-center">
                  {file.map((f, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                    >
                      {fileTypeIcons[f.type] || <FileTextIcon size={18} className="text-gray-400" />}
                      <span className="text-sm text-gray-700 ml-2 mr-3 max-w-xs truncate">
                        {f.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(f.size / 1024).toFixed(1)}KB
                      </span>
                      <button
                        type="button"
                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(file.filter((_, i) => i !== index));
                        }}
                        aria-label={`Remove file ${f.name}`}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <Button
                value="Upload"
                icon={UploadIcon}
                type="submit"
                className="pl-3 mt-3"
                disabled={loading || !file || file.length === 0}
                aria-busy={loading}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </div>
        </div>

        {/* Upload History Section */}
        <div className="ml-13 mr-13">
          <h1 className="text-3xl font-semibold mb-4">Upload History</h1>
          <UploadHistoryTable />
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;