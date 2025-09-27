import React from "react";
import StorageBalance from "@/components/custom/StorageBalance";
import FileUploadForm from "@/components/custom/FileUploadForm";
import { DataViewer } from "@/components/custom/DataViewer";

const UploadPage = () => {
  return (
    <div className="container mx-auto py-8">
      <StorageBalance />
      <FileUploadForm />
      <DataViewer />
    </div>
  );
};

export default UploadPage;
