import { Box, Tooltip } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NoteIcon from '@mui/icons-material/Note';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import type { Student } from '@/models/types';
import { FlagsIconContainer, FlagsIconSpacer } from './StudentsDesktopPage.styles';

interface StudentFlagsProps {
  student: Student;
  layout?: 'horizontal' | 'vertical';
  gap?: number | string;
  hideTextFlags?: boolean;
}

export function StudentFlags({ student, layout = 'horizontal', gap = 0.25, hideTextFlags = false }: StudentFlagsProps) {
  const flagsContent = (
    <>
      <FlagsIconContainer>
        <PhotoCameraIcon fontSize="small" color="action" sx={student.photo ? { opacity: 0.25 } : undefined} />
        {!student.photo && (
          <NotInterestedIcon
            fontSize="small"
            color="error"
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
            }}
          />
        )}
      </FlagsIconContainer>
      {student.preCamp ? (
        <Tooltip title="Pre-Camp">
          <WbSunnyIcon fontSize="small" />
        </Tooltip>
      ) : (
        <FlagsIconSpacer />
      )}
      {student.postCamp ? (
        <Tooltip title="Post-Camp">
          <NightsStayIcon fontSize="small" />
        </Tooltip>
      ) : (
        <FlagsIconSpacer />
      )}
      {!hideTextFlags && (
        <>
          {student.medicalIssues ? (
            <Tooltip title={student.medicalIssues}>
              <LocalHospitalIcon fontSize="small" color="error" />
            </Tooltip>
          ) : (
            <FlagsIconSpacer />
          )}
          {student.specialRequest ? (
            <Tooltip title={student.specialRequest}>
              <NoteIcon fontSize="small" color="action" />
            </Tooltip>
          ) : (
            <FlagsIconSpacer />
          )}
        </>
      )}
    </>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        gap,
        justifyContent: layout === 'vertical' ? 'flex-start' : 'center',
        alignItems: 'center',
      }}
    >
      {flagsContent}
    </Box>
  );
}
