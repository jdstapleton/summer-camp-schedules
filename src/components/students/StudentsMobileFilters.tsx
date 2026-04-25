import { useState } from 'react';
import { Box, Button, Checkbox, Collapse, FormControlLabel, IconButton, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NoteIcon from '@mui/icons-material/Note';
import { NoPhotoIcon } from '@/components/icons/NoPhotoIcon';
import { useStudentsFilters } from '@/contexts/StudentsFiltersContext';
import { MobileFilterPanel, FilterSection, FilterIconRow } from './StudentsMobilePage.styles';

export function StudentsMobileFilters() {
  const [filterOpen, setFilterOpen] = useState(false);
  const {
    filters,
    setFilters,
    showOnlyAllergies,
    setShowOnlyAllergies,
    filterNoPhoto,
    setFilterNoPhoto,
    filterPreCamp,
    setFilterPreCamp,
    filterPostCamp,
    setFilterPostCamp,
    filterMedical,
    setFilterMedical,
    filterSpecialRequest,
    setFilterSpecialRequest,
    uniqueCamps,
    uniqueCustody,
    uniqueTshirtSizes,
    handleMultiSelectChange,
  } = useStudentsFilters();

  const activeFilterCount = [
    filters.name,
    filters.camps.length > 0,
    filters.age,
    filters.custody.length > 0,
    filters.tshirtSize.length > 0,
    filterNoPhoto,
    filterPreCamp,
    filterPostCamp,
    filterMedical,
    filterSpecialRequest,
    showOnlyAllergies,
  ].filter(Boolean).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
        <Button variant={filterOpen ? 'contained' : 'outlined'} startIcon={<TuneIcon />} onClick={() => setFilterOpen(!filterOpen)} size="small">
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </Box>

      <Collapse in={filterOpen}>
        <MobileFilterPanel>
          <FormControlLabel
            control={<Checkbox checked={showOnlyAllergies} onChange={(e) => setShowOnlyAllergies(e.target.checked)} size="small" />}
            label="Show only students with allergies"
            sx={{ m: 0 }}
          />

          <FilterSection>
            <TextField fullWidth size="small" placeholder="Filter by name..." value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          </FilterSection>

          <FilterSection>
            <Select
              multiple
              fullWidth
              size="small"
              value={filters.camps}
              onChange={(e) => handleMultiSelectChange('camps', e.target.value as string[])}
              displayEmpty
              renderValue={(selected) => (selected.length === 0 ? 'All Camps' : `${selected.length} selected`)}
            >
              <MenuItem value="">All Camps</MenuItem>
              {uniqueCamps.map((camp) => (
                <MenuItem key={camp} value={camp}>
                  {camp}
                </MenuItem>
              ))}
            </Select>
          </FilterSection>

          <FilterSection>
            <TextField fullWidth size="small" placeholder="Filter by age..." value={filters.age} onChange={(e) => setFilters({ ...filters, age: e.target.value })} />
          </FilterSection>

          <FilterSection>
            <Select
              multiple
              fullWidth
              size="small"
              value={filters.custody}
              onChange={(e) => handleMultiSelectChange('custody', e.target.value as string[])}
              displayEmpty
              renderValue={(selected) => (selected.length === 0 ? 'All Custody' : `${selected.length} selected`)}
            >
              <MenuItem value="">All Custody</MenuItem>
              {uniqueCustody.map((custody) => (
                <MenuItem key={custody} value={custody}>
                  {custody}
                </MenuItem>
              ))}
            </Select>
          </FilterSection>

          <FilterSection>
            <Select
              multiple
              fullWidth
              size="small"
              value={filters.tshirtSize}
              onChange={(e) => handleMultiSelectChange('tshirtSize', e.target.value as string[])}
              displayEmpty
              renderValue={(selected) => (selected.length === 0 ? 'All Sizes' : `${selected.length} selected`)}
            >
              <MenuItem value="">All Sizes</MenuItem>
              {uniqueTshirtSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FilterSection>

          <FilterSection>
            <Box sx={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 1 }}>Flags</Box>
            <FilterIconRow>
              <Tooltip title={filterNoPhoto ? 'Show all' : 'Show without photo'}>
                <IconButton
                  size="small"
                  onClick={() => setFilterNoPhoto(!filterNoPhoto)}
                  sx={{
                    padding: '4px',
                  }}
                >
                  <NoPhotoIcon fontSize="small" isActive={filterNoPhoto} />
                </IconButton>
              </Tooltip>
              <Tooltip title={filterPreCamp ? 'Show all' : 'Show with pre-camp'}>
                <IconButton
                  size="small"
                  onClick={() => setFilterPreCamp(!filterPreCamp)}
                  sx={{
                    color: filterPreCamp ? 'warning.main' : 'action.disabled',
                  }}
                >
                  <WbSunnyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={filterPostCamp ? 'Show all' : 'Show with post-camp'}>
                <IconButton
                  size="small"
                  onClick={() => setFilterPostCamp(!filterPostCamp)}
                  sx={{
                    color: filterPostCamp ? 'info.main' : 'action.disabled',
                  }}
                >
                  <NightsStayIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={filterMedical ? 'Show all' : 'Show with medical issues'}>
                <IconButton
                  size="small"
                  onClick={() => setFilterMedical(!filterMedical)}
                  sx={{
                    color: filterMedical ? 'error.main' : 'action.disabled',
                  }}
                >
                  <LocalHospitalIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={filterSpecialRequest ? 'Show all' : 'Show with special requests'}>
                <IconButton
                  size="small"
                  onClick={() => setFilterSpecialRequest(!filterSpecialRequest)}
                  sx={{
                    color: filterSpecialRequest ? 'action.main' : 'action.disabled',
                  }}
                >
                  <NoteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </FilterIconRow>
          </FilterSection>
        </MobileFilterPanel>
      </Collapse>
    </Box>
  );
}
