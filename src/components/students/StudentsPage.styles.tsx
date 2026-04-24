import { styled } from '@mui/material/styles';
import { Box, TableCell } from '@mui/material';

export const ActionButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

export const CapitalizedTableCell = styled(TableCell)({
  textTransform: 'capitalize',
});

export const MutedTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));
