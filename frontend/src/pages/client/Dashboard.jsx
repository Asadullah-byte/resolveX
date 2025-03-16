import React, { useCallback } from "react";
import useClientStore from "../../store/clientStore.js";
import { UploadIcon } from "lucide-react";
import Button from "../../components/Button.jsx";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import UploadHistoryTable from "../../components/UploadHistoryTable.jsx";

const Dashboard = () => {
  const { file, response, error, loading, setFile, uploadFile } =
    useClientStore();
  const allowedFileTypes = [
    "text/plain",
    "application/json",
    "application/log",
  ];
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
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || file.length === 0) {
      toast.error("No file selected!");
      return;
    }
    try {
      await uploadFile(); // Assuming this updates `response`
      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="bg-gray min-h-screen w-full">
        <h2 className="text-xl font-semibold mt-8 ml-13">Upload your logs</h2>
        <p className="mt-2.5 ml-13">
          resolveX supports .txt, .json, .log formats only
        </p>

        <form onSubmit={handleUpload} className="flex flex-col items-center">
          {/* Drag and Drop File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-5 w-150 rounded-lg mt-2.5 mb-4 transition cursor-pointer flex flex-col items-center justify-center ${
              isDragActive ? "border-blue-500 bg-gray-100" : "border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="text-gray-500 mb-2" size={32} />
            <p className="text-gray-600 text-center">
              {isDragActive
                ? "Drop the file here..."
                : "Drag & Drop files here or click to upload"}
            </p>
          </div>
          {file && file.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {file.map((f, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-200 rounded-full px-3 py-1"
                >
                  <span className="text-sm text-gray-700">{f.name}</span>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => {
                      setFile(file.filter((_, i) => i !== index)); // Remove file
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            value="Upload"
            icon={UploadIcon}
            type="submit"
            className="pl-3 mt-3"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        <div>
          <h1 className="text-3xl font-semibold mt-8 ml-13 ">Upload History</h1>
          <UploadHistoryTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
