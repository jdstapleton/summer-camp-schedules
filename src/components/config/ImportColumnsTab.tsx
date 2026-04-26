import { useState } from 'react';
import { Box, Button, Chip, IconButton, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { ImportColumnConfig } from '@/models/types';

interface ImportColumnsTabProps {
  importColumnConfig: ImportColumnConfig;
  onAddColumnHeader: (field: keyof ImportColumnConfig, value: string) => void;
  onRemoveColumnHeader: (field: keyof ImportColumnConfig, index: number) => void;
  onReorderColumnHeaders: (field: keyof ImportColumnConfig, from: number, to: number) => void;
}

export function ImportColumnsTab({ importColumnConfig, onAddColumnHeader, onRemoveColumnHeader, onReorderColumnHeaders }: ImportColumnsTabProps) {
  const [draggedItem, setDraggedItem] = useState<{ field: string; index: number } | null>(null);
  const [editingColumnField, setEditingColumnField] = useState<keyof ImportColumnConfig | null>(null);
  const [newColumnHeader, setNewColumnHeader] = useState('');

  function handleAddColumnHeader(field: keyof ImportColumnConfig) {
    if (!newColumnHeader.trim()) return;
    onAddColumnHeader(field, newColumnHeader);
    setNewColumnHeader('');
  }

  function handleDragStart(field: string, index: number) {
    setDraggedItem({ field, index });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(field: string, dropIndex: number) {
    if (!draggedItem || draggedItem.field !== field) {
      setDraggedItem(null);
      return;
    }

    const dragIndex = draggedItem.index;
    if (dragIndex !== dropIndex) {
      onReorderColumnHeaders(field as keyof ImportColumnConfig, dragIndex, dropIndex);
    }
    setDraggedItem(null);
  }

  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Configure column header mappings for Excel imports. Each field can match multiple column headers.
      </Typography>
      {Object.entries(importColumnConfig).map(([field, headers]) => (
        <Box
          key={field}
          sx={{
            mb: 2.5,
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', fontWeight: 600, flex: 1 }}>
              {field.replace(/([A-Z])/g, ' $1').trim()}
            </Typography>
            {editingColumnField !== field && (
              <IconButton size="small" onClick={() => setEditingColumnField(field as keyof ImportColumnConfig)} title="Add column header">
                <AddIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              mb: 1,
              minHeight: headers.length > 0 ? 'auto' : '0px',
            }}
          >
            {headers.map((header: string, idx: number) => (
              <Chip
                key={idx}
                label={header}
                onDelete={() => onRemoveColumnHeader(field as keyof ImportColumnConfig, idx)}
                size="small"
                draggable
                onDragStart={() => handleDragStart(field, idx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(field, idx)}
                sx={{
                  cursor: draggedItem?.field === field ? 'grabbing' : 'grab',
                  opacity: draggedItem?.field === field && draggedItem?.index === idx ? 0.5 : 1,
                }}
              />
            ))}
          </Box>
          {editingColumnField === field && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                value={newColumnHeader}
                onChange={(e) => setNewColumnHeader(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddColumnHeader(field as keyof ImportColumnConfig);
                  }
                }}
                placeholder="Add column header"
                autoFocus
                fullWidth
              />
              <Button onClick={() => handleAddColumnHeader(field as keyof ImportColumnConfig)} variant="outlined" disabled={!newColumnHeader.trim()}>
                Add
              </Button>
              <Button onClick={() => setEditingColumnField(null)} variant="text">
                Done
              </Button>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
