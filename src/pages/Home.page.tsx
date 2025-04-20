import { useEffect, useState, useCallback } from 'react';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { ActionIcon, Alert, Button, Grid, Group, LoadingOverlay, NumberInput, Paper, Space, Text, Title, Tooltip } from '@mantine/core';
import { pb, isUserAuthenticated } from '@/lib/pocketbase';
import { IconAlertCircle, IconCheck, IconRefresh } from '@tabler/icons-react';
import { ClientResponseError } from 'pocketbase';
import { useAuth } from '@/contexts/AuthContext';

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
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const { user } = useAuth();

  // Check if server is available
  const checkServerAvailability = useCallback(async () => {
    try {
      // Simple health check
      await fetch(`${import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      setServerAvailable(true);
      return true;
    } catch (err) {
      console.error('Server availability check failed:', err);
      setServerAvailable(false);
      setError({
        message: 'Cannot connect to the server. Please check if the server is running.',
        type: 'network',
        retryable: true,
        details: err instanceof Error ? err.message : 'Connection failed'
      });
      return false;
    }
  }, []);

  // Helper function to handle errors
  const handleError = useCallback((err: unknown, operation: string): AppError => {
    console.error(`Error during ${operation}:`, err);

    let appError: AppError = {
      message: `Failed to ${operation}. Please try again later.`,
      type: 'unknown',
      retryable: true,
    };

    if (err instanceof ClientResponseError) {
      if (err.status === 401 || err.status === 403) {
        appError = {
          message: 'You do not have permission to perform this action. Please sign in with an admin account.',
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

  const fetchServerData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
      }

      const isAvailable = await checkServerAvailability();
      if (!isAvailable) {
        setLoading(false);
        return;
      }

      const needsAuth = true;
      if (needsAuth && !isUserAuthenticated()) {
        setError({
          message: 'Please sign in to access server data.',
          type: 'auth',
          retryable: false,
        });
        setLoading(false);
        return;
      }

      const records = await pb.collection('server').getFullList();

      if (records.length === 0) {
        console.log('No server data available, creating default record');
        try {
          if (!isUserAuthenticated()) {
            throw new Error('Authentication required to create server data.');
          }

          const defaultData = {
            player_count: 0,
            tps: 20.0,
            mspt: 50.0,
            player_limit: 20
          };

          const newRecord = await pb.collection('server').create(defaultData);
          setServerData(newRecord as ServerData);
          setPlayerLimit(newRecord.player_limit);
          setError(null);
        } catch (createErr) {
          throw new Error('Failed to create default server data. Please check permissions or sign in.');
        }
      } else {
        const latestRecord = records.pop() as ServerData;
        setServerData(latestRecord);
        setPlayerLimit(latestRecord.player_limit);
        setError(null);
      }

      setRetryCount(0);
    } catch (err) {
      const appError = handleError(err, 'load server data');
      setError(appError);

      if (appError.retryable && retryCount < 3) {
        console.log(`Retrying fetch (${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchServerData(true), 2000 * (retryCount + 1));
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  }, [handleError, retryCount, checkServerAvailability]);

  const validatePlayerLimit = (value: number | ''): boolean => {
    if (value === '') return false;
    return value >= 0 && value <= 1000;
  };

  const updatePlayerLimit = async () => {
    if (!serverData || playerLimit === '') {
      return;
    }

    if (!isUserAuthenticated()) {
      setError({
        message: 'You must be signed in to update server settings.',
        type: 'auth',
        retryable: false
      });
      return;
    }

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

      const isAvailable = await checkServerAvailability();
      if (!isAvailable) {
        setUpdating(false);
        return;
      }

      await pb.collection('server').update(serverData.id, {
        player_limit: playerLimit
      });

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
    checkServerAvailability().then(isAvailable => {
      if (isAvailable) {
        fetchServerData();
      } else {
        setLoading(false);
      }
    });

    let subscription: any = null;

    if (isUserAuthenticated()) {
      try {
        subscription = pb.collection('server').subscribe('*', function (e) {
          console.log('Received real-time update:', e);
          if (e.action === 'create' || e.action === 'update') {
            setServerData(e.record as ServerData);
            setPlayerLimit(e.record.player_limit);
          }
        });
      } catch (err) {
        console.error('Subscription error:', err);
        setError(handleError(err, 'establish real-time connection'));
      }
    }

    const refreshInterval = setInterval(() => {
      if (serverAvailable) {
        fetchServerData();
      } else {
        checkServerAvailability();
      }
    }, 60000);

    return () => {
      if (subscription) {
        try {
          pb.collection('server').unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
      clearInterval(refreshInterval);
    };
  }, [fetchServerData, handleError, checkServerAvailability, serverAvailable]);

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

  const renderServerStatus = () => {
    if (serverAvailable === false) {
      return (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Server Unavailable"
          color="red"
          mb="xl"
        >
          <Text>The Pocketbase server is currently unavailable. Make sure it's running and accessible.</Text>
          <Button
            size="xs"
            variant="light"
            mt="sm"
            onClick={() => checkServerAvailability().then(isAvailable => {
              if (isAvailable) fetchServerData();
            })}
            loading={loading}
          >
            Check Connection
          </Button>
        </Alert>
      );
    }

    if (!isUserAuthenticated()) {
      return (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Authentication Required"
          color="yellow"
          mb="xl"
        >
          <Text>You need to sign in to fully access server controls and data.</Text>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <NavbarSimple page="Home" />
      <div style={{ margin: 'var(--mantine-spacing-xl)', position: 'relative', width: '100%' }}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        {renderServerStatus()}
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
                  disabled={loading || updating || !isUserAuthenticated() || !serverAvailable}
                  value={playerLimit}
                  onChange={(value) => {
                    if (typeof value === 'number' || value === '') {
                      setPlayerLimit(value);
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
                    !isUserAuthenticated() ? "Sign in to edit" :
                      !serverAvailable ? "Server unavailable" :
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
                    disabled={loading || !isUserAuthenticated() || !serverAvailable ||
                      playerLimit === serverData?.player_limit || !validatePlayerLimit(playerLimit)}
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
