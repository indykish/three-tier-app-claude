import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  children,
  className = ""
}) => {
  return (
    <Card variant="outlined" className={className}>
      <CardContent>
        <Box className="flex items-center mb-4">
          {icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};
