import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';
import { supabase } from '@/services/supabaseClient';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setMessage('Magic link sent! Check your email and click the link to log in.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Summer Camp Schedules
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Sign in with your email to access the schedule
        </Typography>

        <form onSubmit={handleSignIn}>
          <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required margin="normal" autoFocus />

          <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading || !email} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Send Magic Link'}
          </Button>
        </form>

        {message && (
          <Typography variant="body2" color="success" sx={{ mt: 2 }} align="center">
            {message}
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }} align="center">
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
