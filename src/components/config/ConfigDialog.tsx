import { useState, useRef } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Tab, Tabs } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useAppConfig } from '@/contexts/AppConfigProvider';
import { CampDefaultsTab } from './CampDefaultsTab';
import { ImportColumnsTab } from './ImportColumnsTab';
import { useConfigDialogState } from './useConfigDialogState';

interface ConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ConfigDialog({ open, onClose }: ConfigDialogProps) {
  const { config, updateConfig } = useAppConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const formState = useConfigDialogState(config, open);

  function handleSave() {
    const configToSave = formState.getConfigToSave();
    if (configToSave) {
      updateConfig(configToSave);
      onClose();
    }
  }

  function handleExportConfig() {
    const configToSave = formState.getConfigToSave();
    if (!configToSave) return;

    const jsonString = JSON.stringify(configToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'camp-schedule-config.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImportConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);

        let fieldCount = 0;

        if (imported.gradeRanges && Array.isArray(imported.gradeRanges)) {
          fieldCount++;
        }
        if (imported.extraWeeks && Array.isArray(imported.extraWeeks)) {
          fieldCount++;
        }
        if (imported.defaultMaxSize && typeof imported.defaultMaxSize === 'number') {
          fieldCount++;
        }
        if (imported.importColumnConfig && typeof imported.importColumnConfig === 'object') {
          fieldCount++;
        }

        if (fieldCount === 0) {
          setToastMessage('No valid configuration fields found. Expected: gradeRanges, extraWeeks, defaultMaxSize, or importColumnConfig.');
          setToastOpen(true);
        } else {
          formState.loadConfig(imported);
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
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} sx={{ mb: 2 }}>
          <Tab label="Camp Defaults" />
          <Tab label="Import Columns" />
        </Tabs>

        {tab === 0 && (
          <CampDefaultsTab
            gradeRanges={formState.gradeRanges}
            onAddGradeRange={(value) => {
              formState.addGradeRange(value);
            }}
            onRemoveGradeRange={formState.removeGradeRange}
            extraWeeks={formState.extraWeeks}
            onAddWeek={(value) => {
              formState.addWeek(value);
            }}
            onRemoveWeek={formState.removeWeek}
            defaultMaxSize={formState.defaultMaxSize}
            onDefaultMaxSizeChange={formState.setDefaultMaxSize}
          />
        )}

        {tab === 1 && formState.importColumnConfig && (
          <ImportColumnsTab
            importColumnConfig={formState.importColumnConfig}
            onAddColumnHeader={formState.addColumnHeader}
            onRemoveColumnHeader={formState.removeColumnHeader}
            onReorderColumnHeaders={formState.reorderColumnHeaders}
          />
        )}
      </DialogContent>
      <DialogActions>
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportConfig} />
        <Button onClick={() => fileInputRef.current?.click()} startIcon={<FileUploadIcon />}>
          Import
        </Button>
        <Button onClick={handleExportConfig} startIcon={<FileDownloadIcon />}>
          Export
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setToastOpen(false)} severity="error" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
