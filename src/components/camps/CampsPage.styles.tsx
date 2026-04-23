import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export const MutedBody2 = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const WeekSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const WeekHeading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}));
