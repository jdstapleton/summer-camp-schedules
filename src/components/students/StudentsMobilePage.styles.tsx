import { styled } from '@mui/material/styles';
import { Box, Card } from '@mui/material';

export const StudentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  elevation: 1,
}));

export const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

export const CardNameSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  flex: 1,
});

export const CardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
}));

export const CardSecondaryInfo = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  fontSize: '0.875rem',
}));

export const CardFlagsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(1),
  paddingTop: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const MobileFilterButton = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
}));

export const MobileFilterPanel = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#f5f5f5' : '#424242',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

export const FilterSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const FilterIconRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
}));

export const EmptyStateText = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  padding: theme.spacing(4, 2),
}));

export const NoteRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(0.75),
  cursor: 'pointer',
  padding: theme.spacing(0.5, 0),
}));
