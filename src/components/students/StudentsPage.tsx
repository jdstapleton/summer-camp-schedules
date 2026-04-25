import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useSchedule } from '@/hooks/useSchedule';
import { StudentsFiltersProvider } from '@/contexts/StudentsFiltersProvider';
import type { Student } from '@/models/types';
import { StudentsDesktopPage } from './StudentsDesktopPage';
import { StudentsMobilePage } from './StudentsMobilePage';

export function StudentsPage() {
  const { data } = useSchedule();
  return (
    <StudentsFiltersProvider data={data}>
      <StudentsPageContent />
    </StudentsFiltersProvider>
  );
}

function StudentsPageContent() {
  const { addStudent, updateStudent, deleteStudent } = useSchedule();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleSave = (studentData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      updateStudent({ ...studentData, id: editingStudent.id });
    } else {
      addStudent(studentData);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setDeletingId(null);
  };

  const commonProps = {
    onEdit: handleEdit,
    onAdd: handleAdd,
    dialogOpen,
    editingStudent,
    onSave: handleSave,
    onCloseDialog: () => setDialogOpen(false),
    deletingId,
    onStartDelete: (id: string) => setDeletingId(id),
    onDelete: handleDelete,
    onClosedDeleteDialog: () => setDeletingId(null),
  };

  return isMobile ? <StudentsMobilePage {...commonProps} /> : <StudentsDesktopPage {...commonProps} />;
}
