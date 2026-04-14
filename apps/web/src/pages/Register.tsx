import { useState } from 'react';
import {
  Box, Button, TextField, Typography,
  Divider, InputAdornment, IconButton,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notification.store';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const showNotification = useNotificationStore((s) => s.show);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit({ name, email, password }: RegisterForm) {
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password }, { withCredentials: true });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Something went wrong';
      showNotification(typeof msg === 'string' ? msg : 'Something went wrong', 'error');
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Left panel — branding */}
      <Box sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,71,255,0.3) 0%, transparent 70%)',
          top: 40, left: -60, pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)',
          bottom: -40, right: 20, pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative', textAlign: 'center' }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: 4, mx: 'auto', mb: 3,
            bgcolor: 'primary.main',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 5,
          }}>
            <EmojiEventsIcon sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 1.5, letterSpacing: '-0.5px' }}>
            Good Job
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 320, mx: 'auto', lineHeight: 1.6 }}>
            Be part of a culture that<br />celebrates every win.
          </Typography>

          <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
            {[
              { icon: '🏆', text: '200 pts/month to give to teammates' },
              { icon: '🎁', text: 'Redeem points for real rewards' },
              { icon: '🌟', text: 'Build a culture of appreciation' },
            ].map(({ icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography fontSize={22}>{icon}</Typography>
                <Typography variant="body2">{text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel — form */}
      <Box sx={{
        width: { xs: '100%', md: 480 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, sm: 6 },
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
      }}>
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <EmojiEventsIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Good Job</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Join the team and start recognising great work
          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword((v) => !v)} edge="end">
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 0.5, py: 1.5, fontSize: 16 }}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" align="center" color="text.secondary">
            Already have an account?{' '}
            <Button
              component={Link}
              to="/login"
              variant="text"
              color="primary"
              sx={{ p: 0, minWidth: 0, fontWeight: 600, fontSize: 'inherit' }}
            >
              Sign in
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
