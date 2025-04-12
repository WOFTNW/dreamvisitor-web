import { ActionIcon, Divider, Stack, TextInput, Alert, LoadingOverlay } from '@mantine/core';
import {
  IconArrowDown,
  IconSend,
  IconAlertCircle
} from '@tabler/icons-react';
import classes from './InteractiveConsole.module.css';
import { useRef, useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { ClientResponseError } from 'pocketbase';

// Interface for log data
interface LogData {
  collectionId: string;
  collectionName: string;
  id: string;
  log_msg: string;
  created: string;
  updated: string;
}

export function InteractiveConsole() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const viewport = useRef<HTMLDivElement>(null);

  // Scroll to bottom of console
  const scrollToBottom = useCallback(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    scrollToBottom();
  }, [logs, scrollToBottom]);

  // Handle errors gracefully
  const handleError = useCallback((err: unknown, operation: string): string => {
    console.error(`Error during ${operation}:`, err);

    if (err instanceof ClientResponseError) {
      return err.message || `Error during ${operation}`;
    } else if (err instanceof Error) {
      return err.message;
    }

    return `Failed to ${operation}. Please try again later.`;
  }, []);

  // Fetch initial logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const records = await pb.collection('server_logs').getList(1, 100, {
        sort: 'created',
      });

      setLogs(records.items as LogData[]);
    } catch (err) {
      const errorMessage = handleError(err, 'fetch logs');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchLogs();
    let unsubscribeFunc: (() => void) | null = null;

    try {
      // Subscribe to real-time updates
      const unsubscribePromise = pb.collection('server_logs').subscribe('*', function (e) {
        if (e.action === 'create') {
          setLogs(prev => [...prev, e.record as LogData]);
        }
      });

      // Store the unsubscribe function once the promise resolves
      unsubscribePromise.then(func => {
        unsubscribeFunc = func;
      }).catch(err => {
        const errorMessage = handleError(err, 'establish real-time connection');
        setError(errorMessage);
      });

      // Cleanup subscription on unmount
      return () => {
        if (unsubscribeFunc) {
          unsubscribeFunc();
        }
      };
    } catch (err) {
      const errorMessage = handleError(err, 'establish real-time connection');
      setError(errorMessage);
      return () => { }; // Empty cleanup function
    }
  }, [fetchLogs, handleError]);

  // Handle command submission
  const handleSubmitCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Here you would send the command to your backend
    // For now, just log it to the console
    console.log('Command submitted:', command);
    setCommand('');
  };

  // Format logs display
  const renderLogs = () => {
    if (logs.length === 0 && !loading && !error) {
      return <code className={classes.line}>No logs available.</code>;
    }

    return logs.map((log) => (
      <code
        key={log.id}
        className={classes.line}
        style={{
          whiteSpace: 'pre-wrap',
          display: 'block'
        }}
      >
        {log.log_msg}
      </code>
    ));
  };

  return (
    <Stack className={classes.container} style={{ width: '100%' }}>
      <div className={classes.feedContainer} style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {loading && <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack
          className={classes.feed}
          justify="left"
          gap="0px"
          ref={viewport}
          style={{
            padding: 'var(--mantine-spacing-md)',
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'auto'
          }}
        >
          {renderLogs()}
        </Stack>

        <ActionIcon
          title='Jump to bottom'
          onClick={scrollToBottom}
          variant='white'
          size="xl"
          className={classes.jump}
        >
          <IconArrowDown className={classes.icon} stroke={1.5} />
        </ActionIcon>
      </div>
      <Divider />
      <form
        onSubmit={handleSubmitCommand}
        className={classes.sender}
        style={{
          flexGrow: 0,
          height: 'auto',
          minHeight: '56px',
          maxHeight: '56px'
        }}
      >
        <TextInput
          className={classes.input}
          data-autofocus
          variant="unstyled"
          placeholder="Command"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
        <ActionIcon
          title='Send'
          size="xl"
          type="submit"
          disabled={!command.trim()}
        >
          <IconSend className={classes.icon} stroke={1.5} />
        </ActionIcon>
      </form>
    </Stack>
  );
}
