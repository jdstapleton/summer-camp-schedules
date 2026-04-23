import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, Typography } from '@mui/material';

export const StatCardRoot = styled(Card)({
  minWidth: 160,
});

export const StatCardContent = styled(CardContent)({
  textAlign: 'center',
});

export const StatCardSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const ButtonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

export const StatCardsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));
