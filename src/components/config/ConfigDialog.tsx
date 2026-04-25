import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tab,
  Tabs,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Typography,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useAppConfig } from '@/contexts/AppConfigProvider';
import type { ImportColumnConfig } from '@/models/types';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ConfigDialog({ open, onClose }: ConfigDialogProps) {
  const { config, updateConfig } = useAppConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);
  const [gradeRanges, setGradeRanges] = useState<string[]>([]);
  const [newGradeRange, setNewGradeRange] = useState('');
  const [extraWeeks, setExtraWeeks] = useState<string[]>([]);
  const [newWeek, setNewWeek] = useState('');
  const [defaultMaxSize, setDefaultMaxSize] = useState('10');
  const [importColumnConfig, setImportColumnConfig] = useState<ImportColumnConfig | null>(null);
  const [editingColumnField, setEditingColumnField] = useState<keyof ImportColumnConfig | null>(null);
  const [newColumnHeader, setNewColumnHeader] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [draggedItem, setDraggedItem] = useState<{ field: string; index: number } | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradeRanges([...config.gradeRanges]);
      setExtraWeeks([...config.extraWeeks]);
      setDefaultMaxSize(String(config.defaultMaxSize));
      setImportColumnConfig(JSON.parse(JSON.stringify(config.importColumnConfig)));
      setNewGradeRange('');
      setNewWeek('');
      setNewColumnHeader('');
      setEditingColumnField(null);
      setTab(0);
    }
  }, [open, config]);

  const addGradeRange = () => {
    const trimmed = newGradeRange.trim();
    if (trimmed && !gradeRanges.includes(trimmed)) {
      setGradeRanges([...gradeRanges, trimmed]);
      setNewGradeRange('');
    }
  };

  const removeGradeRange = (index: number) => {
    setGradeRanges(gradeRanges.filter((_, i) => i !== index));
  };

  const addWeek = () => {
    const trimmed = newWeek.trim();
    if (trimmed && !extraWeeks.includes(trimmed)) {
      setExtraWeeks([...extraWeeks, trimmed]);
      setNewWeek('');
    }
  };

  const removeWeek = (index: number) => {
    setExtraWeeks(extraWeeks.filter((_, i) => i !== index));
  };

  const addColumnHeader = (field: keyof ImportColumnConfig) => {
    if (!importColumnConfig || !newColumnHeader.trim()) return;
    const trimmed = newColumnHeader.trim();
    if (!importColumnConfig[field].includes(trimmed)) {
      setImportColumnConfig({
        ...importColumnConfig,
        [field]: [...importColumnConfig[field], trimmed],
      });
      setNewColumnHeader('');
    }
  };

  const removeColumnHeader = (field: keyof ImportColumnConfig, index: number) => {
    if (!importColumnConfig) return;
    setImportColumnConfig({
      ...importColumnConfig,
      [field]: importColumnConfig[field].filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    const parsedMaxSize = parseInt(defaultMaxSize, 10);
    if (!isNaN(parsedMaxSize) && parsedMaxSize >= 1 && importColumnConfig) {
      updateConfig({
        gradeRanges,
        extraWeeks,
        defaultMaxSize: parsedMaxSize,
        importColumnConfig,
      });
      onClose();
    }
  };

  const handleExportConfig = () => {
    const configToExport = {
      gradeRanges,
      extraWeeks,
      defaultMaxSize: parseInt(defaultMaxSize, 10),
      importColumnConfig,
    };
    const jsonString = JSON.stringify(configToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'camp-schedule-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDragStart = (field: string, index: number) => {
    setDraggedItem({ field, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (field: string, dropIndex: number) => {
    if (!draggedItem || !importColumnConfig) return;
    if (draggedItem.field !== field) return;

    const dragIndex = draggedItem.index;
    if (dragIndex === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newHeaders = [...importColumnConfig[field as keyof ImportColumnConfig]];
    const [draggedHeader] = newHeaders.splice(dragIndex, 1);
    newHeaders.splice(dropIndex, 0, draggedHeader);

    setImportColumnConfig({
      ...importColumnConfig,
      [field]: newHeaders,
    });
    setDraggedItem(null);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        let fieldCount = 0;

        if (imported.gradeRanges && Array.isArray(imported.gradeRanges)) {
          setGradeRanges(imported.gradeRanges);
          fieldCount++;
        }
        if (imported.extraWeeks && Array.isArray(imported.extraWeeks)) {
          setExtraWeeks(imported.extraWeeks);
          fieldCount++;
        }
        if (imported.defaultMaxSize && typeof imported.defaultMaxSize === 'number') {
          setDefaultMaxSize(String(imported.defaultMaxSize));
          fieldCount++;
        }
        if (imported.importColumnConfig && typeof imported.importColumnConfig === 'object') {
          setImportColumnConfig(imported.importColumnConfig);
          fieldCount++;
        }

        if (fieldCount === 0) {
          setToastMessage(
            'No valid configuration fields found. Expected: gradeRanges, extraWeeks, defaultMaxSize, or importColumnConfig.',
          );
          setToastOpen(true);
        }
      } catch {
        setToastMessage('Failed to import configuration. Please ensure the file is valid JSON.');
        setToastOpen(true);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} sx={{ mb: 2 }}>
          <Tab label="Camp Defaults" />
          <Tab label="Import Columns" />
        </Tabs>

        {tab === 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Grade Ranges
            </Typography>
            <List dense>
              {gradeRanges.map((range, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeGradeRange(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  }
                >
                  <ListItemText primary={range} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="New Grade Range"
                value={newGradeRange}
                onChange={(e) => setNewGradeRange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addGradeRange();
                  }
                }}
                placeholder="e.g. Grades 1-3"
                fullWidth
              />
              <Button
                onClick={addGradeRange}
                variant="outlined"
                disabled={!newGradeRange.trim() || gradeRanges.includes(newGradeRange.trim())}
              >
                Add
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Extra Default Weeks
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Auto-generated Mondays already appear in the Camp form autocomplete. Add specific
              dates here to always include them.
            </Typography>
            <List dense>
              {extraWeeks.map((week, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeWeek(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  }
                >
                  <ListItemText primary={week} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="New Week"
                value={newWeek}
                onChange={(e) => setNewWeek(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addWeek();
                  }
                }}
                placeholder="e.g. June 8"
                fullWidth
              />
              <Button
                onClick={addWeek}
                variant="outlined"
                disabled={!newWeek.trim() || extraWeeks.includes(newWeek.trim())}
              >
                Add
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Default Max Camp Size
            </Typography>
            <TextField
              label="Default Max Camp Size"
              value={defaultMaxSize}
              onChange={(e) => setDefaultMaxSize(e.target.value)}
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              fullWidth
              size="small"
              helperText="Default camp size when creating new camps. If enrollment exceeds this, multiple instances are created."
            />
          </>
        )}

        {tab === 1 && importColumnConfig && (
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
                  <Typography
                    variant="subtitle2"
                    sx={{ textTransform: 'capitalize', fontWeight: 600, flex: 1 }}
                  >
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  {editingColumnField !== field && (
                    <IconButton
                      size="small"
                      onClick={() => setEditingColumnField(field as keyof ImportColumnConfig)}
                      title="Add column header"
                    >
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
                      onDelete={() =>
                        removeColumnHeader(field as keyof ImportColumnConfig, idx)
                      }
                      size="small"
                      draggable
                      onDragStart={() => handleDragStart(field, idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(field, idx)}
                      sx={{
                        cursor: draggedItem?.field === field ? 'grabbing' : 'grab',
                        opacity:
                          draggedItem?.field === field && draggedItem?.index === idx
                            ? 0.5
                            : 1,
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
                          addColumnHeader(field as keyof ImportColumnConfig);
                        }
                      }}
                      placeholder="Add column header"
                      autoFocus
                      fullWidth
                    />
                    <Button
                      onClick={() =>
                        addColumnHeader(field as keyof ImportColumnConfig)
                      }
                      variant="outlined"
                      disabled={!newColumnHeader.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => setEditingColumnField(null)}
                      variant="text"
                    >
                      Done
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImportConfig}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          startIcon={<FileUploadIcon />}
        >
          Import
        </Button>
        <Button
          onClick={handleExportConfig}
          startIcon={<FileDownloadIcon />}
        >
          Export
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="error" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
