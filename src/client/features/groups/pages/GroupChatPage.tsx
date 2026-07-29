import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import GroupWindow from '../components/GroupWindow';

export default function GroupChatPage() {
  const { groupId } = useParams<{ groupId: string }>();

  if (!groupId) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#7C3AED' }} />
      </Box>
    );
  }

  return <GroupWindow groupId={groupId} />;
}
