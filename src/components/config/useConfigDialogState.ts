import { useState, useEffect } from 'react';
import type { AppConfig, ImportColumnConfig } from '@/models/types';

export function useConfigDialogState(config: AppConfig, open: boolean) {
  const [gradeRanges, setGradeRanges] = useState<string[]>([]);
  const [extraWeeks, setExtraWeeks] = useState<string[]>([]);
  const [defaultMaxSize, setDefaultMaxSize] = useState('10');
  const [importColumnConfig, setImportColumnConfig] = useState<ImportColumnConfig | null>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradeRanges([...config.gradeRanges]);
      setExtraWeeks([...config.extraWeeks]);
      setDefaultMaxSize(String(config.defaultMaxSize));
      setImportColumnConfig(JSON.parse(JSON.stringify(config.importColumnConfig)));
    }
  }, [open, config]);

  function addGradeRange(value: string) {
    const trimmed = value.trim();
    if (trimmed && !gradeRanges.includes(trimmed)) {
      setGradeRanges([...gradeRanges, trimmed]);
    }
  }

  function removeGradeRange(index: number) {
    setGradeRanges(gradeRanges.filter((_, i) => i !== index));
  }

  function addWeek(value: string) {
    const trimmed = value.trim();
    if (trimmed && !extraWeeks.includes(trimmed)) {
      setExtraWeeks([...extraWeeks, trimmed]);
    }
  }

  function removeWeek(index: number) {
    setExtraWeeks(extraWeeks.filter((_, i) => i !== index));
  }

  function addColumnHeader(field: keyof ImportColumnConfig, value: string) {
    if (!importColumnConfig) return;
    const trimmed = value.trim();
    if (!importColumnConfig[field].includes(trimmed)) {
      setImportColumnConfig({
        ...importColumnConfig,
        [field]: [...importColumnConfig[field], trimmed],
      });
    }
  }

  function removeColumnHeader(field: keyof ImportColumnConfig, index: number) {
    if (!importColumnConfig) return;
    setImportColumnConfig({
      ...importColumnConfig,
      [field]: importColumnConfig[field].filter((_, i) => i !== index),
    });
  }

  function reorderColumnHeaders(field: keyof ImportColumnConfig, dragIndex: number, dropIndex: number) {
    if (!importColumnConfig || dragIndex === dropIndex) return;

    const newHeaders = [...importColumnConfig[field]];
    const [draggedHeader] = newHeaders.splice(dragIndex, 1);
    newHeaders.splice(dropIndex, 0, draggedHeader);

    setImportColumnConfig({
      ...importColumnConfig,
      [field]: newHeaders,
    });
  }

  function loadConfig(
    partial: Partial<{
      gradeRanges: string[];
      extraWeeks: string[];
      defaultMaxSize: number;
      importColumnConfig: ImportColumnConfig;
    }>
  ) {
    if (partial.gradeRanges && Array.isArray(partial.gradeRanges)) {
      setGradeRanges(partial.gradeRanges);
    }
    if (partial.extraWeeks && Array.isArray(partial.extraWeeks)) {
      setExtraWeeks(partial.extraWeeks);
    }
    if (partial.defaultMaxSize && typeof partial.defaultMaxSize === 'number') {
      setDefaultMaxSize(String(partial.defaultMaxSize));
    }
    if (partial.importColumnConfig && typeof partial.importColumnConfig === 'object') {
      setImportColumnConfig(partial.importColumnConfig);
    }
  }

  function getConfigToSave() {
    const parsedMaxSize = parseInt(defaultMaxSize, 10);
    if (!isNaN(parsedMaxSize) && parsedMaxSize >= 1 && importColumnConfig) {
      return {
        gradeRanges,
        extraWeeks,
        defaultMaxSize: parsedMaxSize,
        importColumnConfig,
      };
    }
    return null;
  }

  return {
    gradeRanges,
    setGradeRanges,
    addGradeRange,
    removeGradeRange,
    extraWeeks,
    setExtraWeeks,
    addWeek,
    removeWeek,
    defaultMaxSize,
    setDefaultMaxSize,
    importColumnConfig,
    setImportColumnConfig,
    addColumnHeader,
    removeColumnHeader,
    reorderColumnHeaders,
    loadConfig,
    getConfigToSave,
  };
}
