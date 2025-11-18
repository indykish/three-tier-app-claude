import React from 'react';
import { TextField } from '@mui/material';
import { SectionCard } from '@/components/common';
import { BusinessIcon } from '@/components/icons';
import { BrandingSettings } from '@/types/branding';

interface CompanyInformationFormProps {
  settings: BrandingSettings;
  onChange: (field: string, value: string) => void;
  primaryColor: string;
}

export const CompanyInformationForm: React.FC<CompanyInformationFormProps> = ({
  settings,
  onChange,
  primaryColor
}) => {
  return (
    <SectionCard
      title="Company Information"
      icon={<BusinessIcon color={primaryColor} />}
    >
      <TextField
        fullWidth
        label="Company Name"
        value={settings.companyName}
        onChange={(e) => onChange('companyName', e.target.value)}
        className="mb-4"
        required
      />
      
      <TextField
        fullWidth
        label="Company Website (optional)"
        value={settings.companyUrl || ''}
        onChange={(e) => onChange('companyUrl', e.target.value)}
        placeholder="https://example.com"
      />
    </SectionCard>
  );
};
