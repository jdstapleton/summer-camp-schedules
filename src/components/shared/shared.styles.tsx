import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const PageHeaderRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'mb',
})<{ mb?: number }>(({ theme, mb = 2 }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(mb),
}));
