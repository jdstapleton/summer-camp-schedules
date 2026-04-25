import { Box, Checkbox, FormControlLabel, IconButton, MenuItem, Select, TableCell, TableRow, TextField, Tooltip } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NoteIcon from '@mui/icons-material/Note';
import { NoPhotoIcon } from '@/components/icons/NoPhotoIcon';
import { useStudentsFilters } from '@/contexts/StudentsFiltersContext';

export function StudentsFilterRow() {
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
  return (
    <>
      <TableRow sx={{ backgroundColor: '#fafafa' }}>
        <TableCell colSpan={7} sx={{ p: 1 }}>
          <FormControlLabel
            control={<Checkbox checked={showOnlyAllergies} onChange={(e) => setShowOnlyAllergies(e.target.checked)} size="small" />}
            label="Show only students with allergies"
            sx={{ m: 0 }}
          />
        </TableCell>
      </TableRow>
      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
        <TableCell sx={{ p: 0.5, width: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Filter name..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
          />
        </TableCell>
        <TableCell sx={{ p: 0.5, width: 0 }}>
          <Select
            multiple
            fullWidth
            size="small"
            value={filters.camps}
            onChange={(e) => handleMultiSelectChange('camps', e.target.value as string[])}
            displayEmpty
            renderValue={(selected) => (selected.length === 0 ? 'All Camps' : `${selected.length} selected`)}
            slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
          >
            <MenuItem value="">All Camps</MenuItem>
            {uniqueCamps.map((camp) => (
              <MenuItem key={camp} value={camp}>
                {camp}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell sx={{ p: 0.5, width: 0 }} align="right">
          <TextField
            fullWidth
            size="small"
            placeholder="Filter age..."
            value={filters.age}
            onChange={(e) => setFilters({ ...filters, age: e.target.value })}
            slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
          />
        </TableCell>
        <TableCell sx={{ p: 0.5, width: 0 }}>
          <Select
            multiple
            fullWidth
            size="small"
            value={filters.custody}
            onChange={(e) => handleMultiSelectChange('custody', e.target.value as string[])}
            displayEmpty
            renderValue={(selected) => (selected.length === 0 ? 'All Custody' : `${selected.length} selected`)}
            slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
          >
            <MenuItem value="">All Custody</MenuItem>
            {uniqueCustody.map((custody) => (
              <MenuItem key={custody} value={custody}>
                {custody}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell sx={{ p: 0.5, width: 0 }}>
          <Select
            multiple
            fullWidth
            size="small"
            value={filters.tshirtSize}
            onChange={(e) => handleMultiSelectChange('tshirtSize', e.target.value as string[])}
            displayEmpty
            renderValue={(selected) => (selected.length === 0 ? 'All Sizes' : `${selected.length} selected`)}
            slotProps={{ input: { sx: { fontSize: '0.875rem' } } }}
          >
            <MenuItem value="">All Sizes</MenuItem>
            {uniqueTshirtSizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </TableCell>
        <TableCell sx={{ p: 0.5, width: 0 }} align="center">
          <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
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
          </Box>
        </TableCell>
        <TableCell sx={{ p: 0.5, width: 0 }} align="right" />
      </TableRow>
    </>
  );
}
