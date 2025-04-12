import { useEffect, useState, useCallback } from 'react';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { ActionIcon, Alert, Button, Grid, Group, LoadingOverlay, NumberInput, Paper, Space, Text, Title, Tooltip } from '@mantine/core';
import { pb } from '@/lib/pocketbase';
import { IconAlertCircle, IconCheck, IconRefresh } from '@tabler/icons-react';
import { ClientResponseError } from 'pocketbase';

// Interface for server data response
interface ServerData {
  collectionId: string;
  collectionName: string;
  id: string;
  player_count: number;
  tps: number;
  mspt: number;
  player_limit: number;
  created: string;
  updated: string;
}

// Error interface for more structured error handling
interface AppError {
  message: string;
  type: 'network' | 'auth' | 'server' | 'validation' | 'unknown';
  retryable: boolean;
  details?: string;
}

export function HomePage() {
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [playerLimit, setPlayerLimit] = useState<number | ''>(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Helper function to handle errors
  const handleError = useCallback((err: unknown, operation: string): AppError => {
    console.error(`Error during ${operation}:`, err);

    // Default error
    let appError: AppError = {
      message: `Failed to ${operation}. Please try again later.`,
      type: 'unknown',
      retryable: true,
    };

    // Handle PocketBase-specific errors
    if (err instanceof ClientResponseError) {
      if (err.status === 401 || err.status === 403) {
        appError = {
          message: 'You do not have permission to perform this action.',
          type: 'auth',
          retryable: false,
          details: err.message
        };
      } else if (err.status === 404) {
        appError = {
          message: 'Server data not found. Please contact an administrator.',
          type: 'server',
          retryable: false,
          details: err.message
        };
      } else if (err.status >= 500) {
        appError = {
          message: 'Server is currently unavailable. Please try again later.',
          type: 'server',
          retryable: true,
          details: err.message
        };
      } else {
        appError = {
          message: err.message || `Error during ${operation}`,
          type: 'server',
          retryable: true,
          details: `Status: ${err.status}`
        };
      }
    } else if (err instanceof Error) {
      // Network errors (like fetch failures)
      if (err.message.includes('network') || err.message.includes('fetch')) {
        appError = {
          message: 'Network connection error. Please check your internet connection.',
          type: 'network',
          retryable: true,
          details: err.message
        };
      } else {
        appError = {
          message: err.message,
          type: 'unknown',
          retryable: true,
          details: err.stack
        };
      }
    }

    return appError;
  }, []);

  // Function to fetch server data with retry logic
  const fetchServerData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
      }

      const records = await pb.collection('server').getFullList();

      if (records.length === 0) {
        throw new Error('No server data available');
      }

      const latestRecord = records.pop() as ServerData;
      setServerData(latestRecord);
      setPlayerLimit(latestRecord.player_limit);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const appError = handleError(err, 'load server data');
      setError(appError);

      // Auto-retry logic for retryable errors
      if (appError.retryable && retryCount < 3) {
        console.log(`Retrying fetch (${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchServerData(true), 2000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [handleError, retryCount]);

  // Validate player limit input
  const validatePlayerLimit = (value: number | ''): boolean => {
    if (value === '') return false;
    return value >= 0 && value <= 1000; // Assuming reasonable max limit
  };

  // Function to update player limit with validation
  const updatePlayerLimit = async () => {
    if (!serverData || playerLimit === '') {
      return;
    }

    // Validate input
    if (!validatePlayerLimit(playerLimit)) {
      setError({
        message: 'Invalid player limit. Please enter a number between 0 and 1000.',
        type: 'validation',
        retryable: false
      });
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      await pb.collection('server').update(serverData.id, {
        player_limit: playerLimit
      });

      // Show success indicator briefly
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);
    } catch (err) {
      const appError = handleError(err, 'update player limit');
      setError(appError);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchServerData();

    // Set up real-time subscription with error handling
    try {
      try {
        const subscription = pb.collection('server').subscribe('*', function (e) {
          console.log('Received real-time update:', e);
          if (e.action === 'create' || e.action === 'update') {
            setServerData(e.record as ServerData);
            setPlayerLimit(e.record.player_limit);
          }
        },
        );
      } catch (err) {
        console.error('Subscription error:', err);
        setError(handleError(err, 'establish real-time connection'));
      }
      // Optional: Set up a timer as fallback for real-time updates
      const refreshInterval = setInterval(() => fetchServerData(), 60000);

      return () => {
        // Clean up subscription and interval on component unmount
        try {
          pb.collection('server').unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
        clearInterval(refreshInterval);
      };
    } catch (err) {
      setError(handleError(err, 'set up real-time updates'));
    }
  }, [fetchServerData, handleError]);

  const handleRefresh = () => {
    setRetryCount(0);
    fetchServerData();
  };

  const renderErrorAlert = () => {
    if (!error) return null;

    const getIconColor = () => {
      switch (error.type) {
        case 'auth': return 'red';
        case 'network': return 'orange';
        case 'server': return 'red';
        case 'validation': return 'yellow';
        default: return 'red';
      }
    };

    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={error.type.charAt(0).toUpperCase() + error.type.slice(1) + ' Error'}
        color={getIconColor()}
        withCloseButton
        mb="xl"
        onClose={() => setError(null)}
      >
        <Text>{error.message}</Text>
        {error.details && (
          <Text size="xs" mt="xs" c="dimmed">
            Details: {error.details}
          </Text>
        )}
        {error.retryable && (
          <Button
            size="xs"
            variant="light"
            mt="sm"
            onClick={handleRefresh}
            loading={loading}
          >
            Retry
          </Button>
        )}
      </Alert>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <NavbarSimple page="Home" />
      <div style={{ margin: 'var(--mantine-spacing-xl)', position: 'relative', width: '100%' }}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        {renderErrorAlert()}

        <Group justify="flex-end" mb="md">
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh Data
          </Button>
        </Group>

        <Grid align="stretch" grow>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>Player count</Title>
              <Space h='sm'></Space>
              <Title>
                {serverData?.player_count ?? 0}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>TPS</Title>
              <Space h='sm'></Space>
              <Title>
                {serverData?.tps ?? 0}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>MSPT</Title>
              <Space h='sm'></Space>
              <Title>
                {serverData?.mspt ?? 0}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>Player limit</Title>
              <Space h='sm'></Space>
              <Group gap={8}>
                <NumberInput
                  style={{ flex: 1 }}
                  disabled={loading || updating}
                  value={playerLimit}
                  onChange={(value) => {
                    if (typeof value === 'number' || value === '') {
                      setPlayerLimit(value);
                      // Clear validation errors when input changes
                      if (error?.type === 'validation') {
                        setError(null);
                      }
                    }
                  }}
                  min={0}
                  max={1000}
                  error={error?.type === 'validation' ? error.message : null}
                />
                <Tooltip
                  label={
                    updating ? "Updating..." :
                      updateSuccess ? "Updated successfully!" :
                        "Set player limit"
                  }
                >
                  <ActionIcon
                    color={updateSuccess ? "green" : "blue"}
                    variant="filled"
                    onClick={updatePlayerLimit}
                    loading={updating}
                    disabled={loading || playerLimit === serverData?.player_limit || !validatePlayerLimit(playerLimit)}
                  >
                    {updateSuccess ? <IconCheck size={18} /> : "Set"}
                  </ActionIcon>
                </Tooltip>
              </Group>
              {playerLimit !== serverData?.player_limit && validatePlayerLimit(playerLimit) && (
                <Text size="xs" mt="xs" c="dimmed">
                  Changes will be applied when you click Set
                </Text>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}
