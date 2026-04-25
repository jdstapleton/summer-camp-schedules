import { styled } from '@mui/material/styles';
import { Box, Table, TableCell } from '@mui/material';

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

export const StyledTable = styled(Table)({
  tableLayout: 'fixed',
});

export const NameCellContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
});

export const FlagsCellContent = styled(Box)({
  display: 'flex',
  gap: 0.25,
  justifyContent: 'center',
});

export const FlagsIconContainer = styled(Box)({
  position: 'relative',
  display: 'inline-flex',
});

export const FlagsIconSpacer = styled(Box)({
  width: '1.25rem',
});

export const FlagsCellWrapper = styled(TableCell)({
  whiteSpace: 'nowrap',
});

export const NameColumnCell = styled(TableCell)({
  width: '25%',
});

export const CampsColumnCell = styled(TableCell)({
  width: '18%',
});

export const AgeColumnCell = styled(TableCell)({
  width: '8%',
});

export const CustodyColumnCell = styled(TableCell)({
  width: '13%',
});

export const TshirtSizeColumnCell = styled(TableCell)({
  width: '13%',
});

export const FlagsColumnCell = styled(TableCell)({
  width: '13%',
});

export const ActionsColumnCell = styled(TableCell)({
  width: '10%',
});
