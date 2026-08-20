import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ReportUploader = ({ onUpload, file, setFile }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    onDrop: accepted => setFile(accepted[0])
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      {file ? (
        <div className="flex items-center justify-center text-primary font-medium">
          <File className="mr-2 h-5 w-5" /> {file.name}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Drag & drop your PDF or image here, or click to select</p>
      )}
    </div>
  );
};
