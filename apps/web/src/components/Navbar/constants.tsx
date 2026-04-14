import AddReactionIcon from '@mui/icons-material/AddReaction';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonIcon from '@mui/icons-material/Person';

export const NAV_ITEMS = [
  { path: '/', label: 'Feed', icon: <AddReactionIcon fontSize="small" /> },
  { path: '/rewards', label: 'Rewards', icon: <CardGiftcardIcon fontSize="small" /> },
];

export const PROFILE_ITEM = {
  path: '/profile',
  label: 'My Profile',
  icon: <PersonIcon fontSize="small" />,
};
