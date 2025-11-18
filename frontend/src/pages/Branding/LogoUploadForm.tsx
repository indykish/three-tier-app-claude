import React from 'react';
import { Typography } from '@mui/material';
import { SectionCard, FileUpload } from '@/components/common';
import { UploadIcon } from '@/components/icons';

interface LogoUploadFormProps {
  logoFile: File | null;
  onLogoChange: (file: File | null) => void;
  primaryColor: string;
  textColor: string;
  accentColor: string;
  onError: (error: string) => void;
}

export const LogoUploadForm: React.FC<LogoUploadFormProps> = ({
  logoFile,
  onLogoChange,
  primaryColor,
  textColor,
  accentColor,
  onError
}) => {
  return (
    <SectionCard
      title="Company Logo"
      icon={<UploadIcon color={primaryColor} />}
    >
      <FileUpload
        onFileChange={onLogoChange}
        selectedFile={logoFile}
        textColor={textColor}
        accentColor={accentColor}
        onError={onError}
      />
      
      <Typography variant="caption" display="block" className="mt-2 text-gray-500">
        Recommended: PNG or SVG, max 2MB
      </Typography>
    </SectionCard>
  );
};
