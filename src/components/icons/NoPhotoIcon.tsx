import { Box } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

export function NoPhotoIcon({
  fontSize = 'small',
  isActive = false,
}: {
  fontSize?: 'small' | 'medium' | 'large',
  isActive?: boolean,
}) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <PhotoCameraIcon
        fontSize={fontSize}
        sx={{
          opacity: 0.25,
          color: isActive ? 'rgba(211, 47, 47, 0.25)' : 'rgba(0, 0, 0, 0.26)',
        }}
      />
      <NotInterestedIcon
        fontSize={fontSize}
        sx={{
          position: 'absolute',
          top: -4,
          right: -4,
          color: isActive ? '#d32f2f' : 'rgba(0, 0, 0, 0.26)',
        }}
      />
    </Box>
  );
}
