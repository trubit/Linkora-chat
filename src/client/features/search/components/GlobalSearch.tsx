import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  Group as GroupIcon,
  Public as CommunityIcon,
  Tag as ChannelIcon,
} from '@mui/icons-material';
import { useSearchStore } from '@/store/searchStore';
import { useSearch } from '../queries/index';
import type { SearchResult } from '@shared/types/search.js';

// ---------------------------------------------------------------------------
// Result item
// ---------------------------------------------------------------------------

function SearchResultItem({ result }: { result: SearchResult }) {
  const icon =
    result.type === 'user' ? <PersonIcon /> :
    result.type === 'message' ? <MessageIcon /> :
    result.type === 'group' ? <GroupIcon /> :
    result.type === 'community' ? <CommunityIcon /> :
    <ChannelIcon />;

  const primary =
    result.type === 'user' ? result.displayName :
    result.type === 'message' ? result.senderName :
    result.type === 'group' ? result.name :
    result.type === 'community' ? result.name :
    result.name;

  const secondary =
    result.type === 'user' ? `@${result.username}` :
    result.type === 'message' ? result.highlight ?? result.content :
    result.type === 'group' ? `${result.memberCount} members` :
    result.type === 'community' ? `${result.memberCount} members` :
    result.groupName;

  const avatar =
    result.type === 'user' ? result.avatar :
    result.type === 'group' || result.type === 'community' ? result.avatar :
    undefined;

  return (
    <ListItem
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1 }}
    >
      <ListItemAvatar>
        <Avatar src={avatar} sx={{ width: 36, height: 36 }}>
          {icon}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {primary}
            </Typography>
            <Chip
              label={result.type}
              size="small"
              sx={{ height: 18, fontSize: 10 }}
            />
          </Stack>
        }
        secondary={
          <Typography variant="caption" color="text.secondary" noWrap>
            {secondary}
          </Typography>
        }
      />
    </ListItem>
  );
}

// ---------------------------------------------------------------------------
// GlobalSearch Dialog
// ---------------------------------------------------------------------------

const TYPE_FILTERS = ['user', 'message', 'group', 'community', 'channel'] as const;

interface GlobalSearchProps {
  open?: boolean;
  onClose?: () => void;
}

export function GlobalSearch({ open: openProp, onClose: onCloseProp }: GlobalSearchProps = {}) {
  const { isOpen, query, results, activeTypes, lastResponse, toggleType, setQuery, closeSearch, addRecentSearch } =
    useSearchStore();

  const dialogOpen = openProp ?? isOpen;

  const [inputValue, setInputValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isFetching } = useSearch(query, activeTypes.length > 0 ? activeTypes : undefined);

  const handleInput = useCallback(
    (value: string) => {
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setQuery(value);
        if (value.trim()) addRecentSearch(value.trim());
      }, 300);
    },
    [setQuery, addRecentSearch],
  );

  const handleClose = () => {
    closeSearch();
    onCloseProp?.();
  };

  const facets = lastResponse?.facets;

  return (
    <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogContent sx={{ p: 0 }}>
        {/* Search Input */}
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search people, messages, groups…"
            value={inputValue}
            onChange={(e) => handleInput(e.target.value)}
            variant="outlined"
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {isFetching ? <CircularProgress size={18} /> : <SearchIcon />}
                  </InputAdornment>
                ),
                endAdornment: inputValue && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleInput('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Type filters */}
        <Stack direction="row" spacing={0.5} sx={{ px: 2, pb: 1, flexWrap: 'wrap', gap: 0.5 }}>
          {TYPE_FILTERS.map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              onClick={() => toggleType(type)}
              variant={activeTypes.includes(type) ? 'filled' : 'outlined'}
              color={activeTypes.includes(type) ? 'primary' : 'default'}
            />
          ))}
        </Stack>

        <Divider />

        {/* Facets */}
        {facets && query && (
          <Stack direction="row" spacing={1} sx={{ px: 2, py: 0.5, flexWrap: 'wrap' }}>
            {Object.entries(facets).map(([key, count]) =>
              count > 0 ? (
                <Typography key={key} variant="caption" color="text.secondary">
                  {count} {key}
                </Typography>
              ) : null,
            )}
          </Stack>
        )}

        {/* Results */}
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {results.length === 0 && query && !isFetching && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                No results for &quot;{query}&quot;
              </Typography>
            </Box>
          )}
          {results.length === 0 && !query && (
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Type to search across messages, people, and groups
              </Typography>
            </Box>
          )}
          {results.length > 0 && (
            <List dense disablePadding sx={{ px: 1 }}>
              {results.map((r, i) => (
                <SearchResultItem key={`${r.type}-${r._id}-${i}`} result={r} />
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
