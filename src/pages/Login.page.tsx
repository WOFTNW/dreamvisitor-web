import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Group, Box, Title, Text, Paper, Anchor, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is already handled in the auth context
    }
  };

  return (
    <Box style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--mantine-color-gray-0)'
    }}>
      <Paper shadow="md" p={30} mt={30} radius="md" style={{ width: '400px' }}>
        <Title ta="center" order={2} mt="md" mb={20}>
          Welcome to Dreamvisitor Web
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            mb="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            mb="md"
          />
          <Button fullWidth mt="lg" type="submit" loading={isLoading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
