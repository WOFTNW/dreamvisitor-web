import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextInput, Button, Box, Title, Text, Paper, Anchor, Alert } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { pb } from '@/lib/pocketbase';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await pb.collection('users').requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
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
          Reset your password
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {success ? (
          <Alert icon={<IconCheck size={16} />} color="green" mb="md">
            Password reset email sent! Please check your inbox.
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              mb="md"
            />

            <Button fullWidth mt="md" type="submit" loading={isLoading}>
              Send reset link
            </Button>
          </form>
        )}

        <Text ta="center" mt="md">
          <Anchor component={Link} to="/login">
            Back to login
          </Anchor>
        </Text>
      </Paper>
    </Box>
  );
}
