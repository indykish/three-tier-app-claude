import React from 'react';
import { Box, Button, Chip } from '@mui/material';
import { UploadIcon } from '../icons/UploadIcon';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  buttonText?: string;
  textColor: string;
  accentColor: string;
  maxSize?: number; // in MB
  onError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  selectedFile,
  accept = "image/*",
  buttonText = "Choose Logo File",
  textColor,
  accentColor,
  maxSize = 2,
  onError
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        onError?.(`File must be smaller than ${maxSize}MB`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        onError?.('Please upload an image file');
        return;
      }
      onFileChange(file);
    }
  };

  return (
    <Box className="mb-4">
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
      />
      <label htmlFor="file-upload">
        <Button
          variant="outlined"
          component="span"
          fullWidth
          startIcon={<UploadIcon color={textColor} />}
          className="py-3"
          style={{
            borderColor: accentColor,
            color: textColor
          }}
        >
          {buttonText}
        </Button>
      </label>
      
      {selectedFile && (
        <Chip
          label={`📎 ${selectedFile.name}`}
          color="success"
          className="mt-2"
        />
      )}
    </Box>
  );
};
