import { styled } from '@mui/material/styles';
import { Box, Card } from '@mui/material';

export const CampCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}));

export const CardHeader = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

export const CardNameSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
});

export const CardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  flexShrink: 0,
}));

export const CardInfoGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));
