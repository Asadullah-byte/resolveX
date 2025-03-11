import React, { useCallback } from "react";
import useClientStore from "../../store/clientStore.js";
import { UploadIcon } from "lucide-react";
import Button from "../../components/Button.jsx";
import { useDropzone } from "react-dropzone";

const Dashboard = () => {
  const { file, response, error, loading, setFile, uploadFile } = useClientStore();

  const handleDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]); // Assuming single file upload
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: ".log,.txt,.json",
  });

  const handleUpload = (event) => {
    event.preventDefault();
    uploadFile();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="bg-gray min-h-screen w-full">
        <h2 className="text-xl font-semibold mt-8 ml-13">Upload your logs</h2>
        <p className="mt-2.5 ml-13">resolveX supports .txt, .json, .log formats only</p>

        <form onSubmit={handleUpload} className="flex flex-col items-center">
          {/* Drag and Drop File Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-5 w-150 \ rounded-lg mt-2.5 mb-4 transition cursor-pointer flex flex-col items-center justify-center ${
              isDragActive ? "border-blue-500 bg-gray-100" : "border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="text-gray-500 mb-2" size={32} />
            <p className="text-gray-600 text-center">
              {isDragActive ? "Drop the file here..." : "Drag & Drop files here or click to upload"}
            </p>
          </div>

          {file && <p className="mt-2 text-gray-700">Selected File: {file.name}</p>}

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

        {response && (
          <div className="mt-4 p-3 bg-gray-200 rounded">
            <h3 className="font-semibold text-gray-700">{response.message}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
