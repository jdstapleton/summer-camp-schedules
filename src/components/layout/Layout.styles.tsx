import { styled } from '@mui/material/styles';
import { Box, Container, Typography } from '@mui/material';

export const AppShell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

export const BrandTypography = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(3),
  fontWeight: 700,
}));

export const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  flex: 1,
}));
