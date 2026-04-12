import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export function Login() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = tab === 0 ? '/api/auth/login' : '/api/auth/register';
      const payload = tab === 0 ? { email: form.email, password: form.password } : form;
      const { data } = await axios.post(endpoint, payload, { withCredentials: true });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Something went wrong';
      setError(typeof msg === 'string' ? msg : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(108,71,255,0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,107,107,0.06) 0%, transparent 50%)
      `,
    }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 1.5,
            background: 'linear-gradient(135deg, #6c47ff 0%, #8b6dff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <EmojiEventsIcon sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>Good Job</Typography>
          <Typography variant="body2" color="text.secondary">Peer recognition platform</Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tab === 1 && (
            <TextField
              label="Full Name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          )}
          <TextField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <TextField
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {tab === 0 ? 'Login' : 'Create Account'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
