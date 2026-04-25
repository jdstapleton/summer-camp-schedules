import { alpha, styled } from '@mui/material/styles';
import { Badge, Box, Card, FormControl, Typography } from '@mui/material';
import type { Gender } from '@/models/types';

const genderColor = (gender: Gender): string => {
  if (gender === 'male') return '#bbdefb';
  if (gender === 'female') return '#f8bbd0';
  return '#e8f5e9';
};

export const ControlsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
}));

export const WeekFilterControl = styled(FormControl)({
  minWidth: 200,
});

export const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  color: theme.palette.text.secondary,
}));

export const MutedTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const WeekSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  borderBottom: '2px solid',
  borderColor: theme.palette.divider,
}));

export const WeekHeading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: '1px solid',
  borderColor: theme.palette.action.hover,
  fontWeight: 600,
}));

export const CampSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const CampHeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1.5),
}));

export const CampMaxSizeSpan = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginLeft: theme.spacing(1),
}));

export const InstanceCardsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const InstanceCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isOver' && prop !== 'isDropTarget',
})<{ isOver?: boolean; isDropTarget?: boolean }>(({ theme, isOver, isDropTarget }) => ({
  flex: '1 1 200px',
  maxWidth: 280,
  ...(isDropTarget && {
    outline: '1px dashed',
    outlineColor: theme.palette.divider,
  }),
  ...(isOver && {
    outline: '2px dashed',
    outlineColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  }),
}));

export const InstanceHeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

export const AllergyIconWrapper = styled(Box)({
  position: 'relative',
  display: 'inline-flex',
});

export const AllergyOverlayIconWrapper = styled(Box)({
  position: 'absolute',
  top: -2,
  right: -2,
  display: 'flex',
});

export const StudentList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const StudentPill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'gender' && prop !== 'isPillDragging',
})<{ gender: Gender; isPillDragging?: boolean }>(({ theme, gender, isPillDragging }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: genderColor(gender),
  fontSize: '0.875rem',
  cursor: 'grab',
  opacity: isPillDragging ? 0.4 : 1,
  '&:active': { cursor: 'grabbing' },
}));

export const PillIconsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export const FriendGroupBadge = styled(Badge)({
  '& .MuiBadge-badge': {
    bottom: 12,
  },
});

export const MenuItemIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
}));
