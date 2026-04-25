import { memo, useState } from 'react';
import { CardContent, Chip, Tooltip, Typography } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NoteIcon from '@mui/icons-material/Note';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { PeanutIcon } from '@/components/icons/PeanutIcon';
import type { CampInstance, Gender } from '@/models/types';
import {
  AllergyIconWrapper,
  AllergyOverlayIconWrapper,
  CampHeaderRow,
  CampMaxSizeSpan,
  CampSection,
  FriendGroupBadge,
  InstanceCard,
  InstanceCardsRow,
  InstanceHeaderRow,
  MutedTypography,
  PillIconsRow,
  StudentList,
  StudentPill,
} from './SchedulePage.styles';

interface DragPayload {
  studentId: string;
  fromInstanceId: string;
  campId: string;
}

export interface CampBlockProps {
  campId: string;
  instances: CampInstance[];
  getCampName: (id: string) => string;
  getCampMaxSize: (id: string) => number;
  getStudentName: (id: string) => string;
  getStudentSortKey: (id: string) => string;
  getStudentGender: (id: string) => Gender;
  getStudentFriendGroup: (campId: string, studentId: string) => number | null;
  getStudentNotes: (id: string) => { medical: string; special: string };
  hasNutAllergy: (instance: CampInstance) => boolean;
  onMoveStudent: (studentId: string, fromInstanceId: string, toInstanceId: string) => void;
}

export const CampBlock = memo(function CampBlock({
  campId,
  instances,
  getCampName,
  getCampMaxSize,
  getStudentName,
  getStudentSortKey,
  getStudentGender,
  getStudentFriendGroup,
  getStudentNotes,
  hasNutAllergy,
  onMoveStudent,
}: CampBlockProps) {
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [dragOverInstanceId, setDragOverInstanceId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, studentId: string, fromInstanceId: string) => {
    const payload: DragPayload = { studentId, fromInstanceId, campId };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDragging(payload);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOverInstanceId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (instanceId: string) => {
    setDragOverInstanceId(instanceId);
  };

  const handleDragLeave = (e: React.DragEvent, instanceId: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverInstanceId((prev) => (prev === instanceId ? null : prev));
    }
  };

  const handleDrop = (e: React.DragEvent, toInstanceId: string) => {
    e.preventDefault();
    setDragOverInstanceId(null);
    setDragging(null);
    try {
      const payload: DragPayload = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (payload.campId === campId && payload.fromInstanceId !== toInstanceId) {
        onMoveStudent(payload.studentId, payload.fromInstanceId, toInstanceId);
      }
    } catch {
      // ignore malformed drag data
    }
  };

  const isDragging = dragging !== null;

  return (
    <CampSection>
      <CampHeaderRow>
        <Typography variant="h6">
          {getCampName(campId)}
          <CampMaxSizeSpan variant="body2">(max {getCampMaxSize(campId)})</CampMaxSizeSpan>
        </Typography>
        <Chip label={`${instances.length} instance${instances.length > 1 ? 's' : ''}`} size="small" color={instances.length > 1 ? 'warning' : 'default'} />
      </CampHeaderRow>

      <InstanceCardsRow>
        {instances.map((inst) => {
          const isOver = dragOverInstanceId === inst.id && dragging?.fromInstanceId !== inst.id;
          const isSource = dragging?.fromInstanceId === inst.id;

          return (
            <InstanceCard
              key={inst.id}
              variant="outlined"
              isOver={isOver}
              isDropTarget={isDragging && !isSource}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(inst.id)}
              onDragLeave={(e) => handleDragLeave(e, inst.id)}
              onDrop={(e) => handleDrop(e, inst.id)}
            >
              <CardContent>
                <InstanceHeaderRow>
                  <Typography variant="subtitle2">
                    Instance {inst.instanceNumber} — {inst.studentIds.length} student
                    {inst.studentIds.length !== 1 ? 's' : ''}
                  </Typography>
                  {hasNutAllergy(inst) && (
                    <Tooltip title="No Nuts - Nut allergy in instance">
                      <AllergyIconWrapper>
                        <PeanutIcon fontSize="small" color="action" />
                        <AllergyOverlayIconWrapper>
                          <NotInterestedIcon fontSize="small" color="error" />
                        </AllergyOverlayIconWrapper>
                      </AllergyIconWrapper>
                    </Tooltip>
                  )}
                </InstanceHeaderRow>
                <StudentList>
                  {[...inst.studentIds]
                    .sort((a, b) => getStudentSortKey(a).localeCompare(getStudentSortKey(b)))
                    .map((id) => {
                      const friendGroup = getStudentFriendGroup(campId, id);
                      const isPillDragging = dragging?.studentId === id && dragging?.fromInstanceId === inst.id;
                      return (
                        <StudentPill
                          key={id}
                          gender={getStudentGender(id)}
                          isPillDragging={isPillDragging}
                          draggable
                          onDragStart={(e) => handleDragStart(e, id, inst.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <span>{getStudentName(id)}</span>
                          <PillIconsRow>
                            {(() => {
                              const notes = getStudentNotes(id);
                              return (
                                <>
                                  {notes.medical && (
                                    <Tooltip title={notes.medical} placement="top">
                                      <LocalHospitalIcon fontSize="small" color="error" />
                                    </Tooltip>
                                  )}
                                  {notes.special && (
                                    <Tooltip title={notes.special} placement="top">
                                      <NoteIcon fontSize="small" color="action" />
                                    </Tooltip>
                                  )}
                                </>
                              );
                            })()}
                            {friendGroup && (
                              <Tooltip title={`Friend Group ${friendGroup}`} placement="right">
                                <FriendGroupBadge
                                  badgeContent={friendGroup}
                                  color="primary"
                                  anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                  }}
                                >
                                  <GroupsIcon color="secondary" />
                                </FriendGroupBadge>
                              </Tooltip>
                            )}
                          </PillIconsRow>
                        </StudentPill>
                      );
                    })}
                  {inst.studentIds.length === 0 && <MutedTypography variant="body2">No students assigned</MutedTypography>}
                </StudentList>
              </CardContent>
            </InstanceCard>
          );
        })}
      </InstanceCardsRow>
    </CampSection>
  );
});
