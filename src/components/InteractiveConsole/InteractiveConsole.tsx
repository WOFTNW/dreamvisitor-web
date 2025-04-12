import { ActionIcon, Divider, Stack, TextInput, Alert, LoadingOverlay, Badge, Tooltip } from '@mantine/core';
import {
  IconArrowDown,
  IconSend,
  IconAlertCircle,
  IconBell,
  IconArrowForward
} from '@tabler/icons-react';
import classes from './InteractiveConsole.module.css';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
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

// Interface for command data
interface CommandData {
  id: string;
  command: string;
  status: 'sent' | 'received' | 'executed' | 'failed'; // Updated from boolean executed to status enum
  created: string;
  updated: string;
}

export function InteractiveConsole() {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [commands, setCommands] = useState<CommandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState('');
  const [sendingCommand, setSendingCommand] = useState(false);
  const [failedCommandIds, setFailedCommandIds] = useState<Set<string>>(new Set());
  const [viewedFailedCommands, setViewedFailedCommands] = useState<Set<string>>(new Set());
  const [currentFailedCommandIndex, setCurrentFailedCommandIndex] = useState<number>(0);
  const viewport = useRef<HTMLDivElement>(null);
  const failedCommandRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Scroll to bottom of console
  const scrollToBottom = useCallback(() => {
    if (viewport.current) {
      viewport.current.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll when new logs or commands arrive
  useEffect(() => {
    scrollToBottom();
  }, [logs, commands, scrollToBottom]);

  // Handle errors gracefully
  const handleError = useCallback((err: unknown, operation: string): string => {
    console.error(`Error during ${operation}:`, err);

    if (err instanceof ClientResponseError) {
      // Check for validation errors
      if (err.status === 400 && err.data?.data) {
        // Extract specific field errors from the response
        const fieldErrors = Object.entries(err.data.data)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');

        return `Validation error: ${fieldErrors || err.message}`;
      }
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

  // Fetch recent commands
  const fetchCommands = useCallback(async () => {
    try {
      const records = await pb.collection('server_commands').getList(1, 20, {
        sort: '-created', // Newest first
      });

      setCommands(records.items as unknown as CommandData[]);
    } catch (err) {
      const errorMessage = handleError(err, 'fetch commands');
      setError(errorMessage);
    }
  }, [handleError]);

  // Track failed commands and create refs for scrolling
  useEffect(() => {
    const newFailedIds = new Set<string>();

    commands.forEach(cmd => {
      if (cmd.status === 'failed') {
        newFailedIds.add(cmd.id);
      }
    });

    setFailedCommandIds(newFailedIds);
  }, [commands]);

  // Reset failed command tracking when the set of failed commands changes
  useEffect(() => {
    if (failedCommandIds.size === 0) {
      setViewedFailedCommands(new Set());
      setCurrentFailedCommandIndex(0);
    }
  }, [failedCommandIds]);

  // Scroll to specific failed command and cycle through all failed commands
  const scrollToFailedCommand = () => {
    if (failedCommandIds.size === 0) return;

    // Get all failed command elements
    const failedElements = Array.from(failedCommandRefs.current.entries());
    if (failedElements.length === 0) return;

    // Sort elements by their position in the document (top to bottom)
    failedElements.sort((a, b) => {
      const rectA = a[1].getBoundingClientRect();
      const rectB = b[1].getBoundingClientRect();
      return rectA.top - rectB.top;
    });

    // If we've gone through all commands, start over
    if (currentFailedCommandIndex >= failedElements.length) {
      setCurrentFailedCommandIndex(0);
    }

    // Get the current failed command to show
    const [commandId, element] = failedElements[currentFailedCommandIndex];

    // Scroll to the element
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight the element temporarily
    element.style.transition = 'background-color 0.5s ease';
    element.style.backgroundColor = 'var(--mantine-color-red-1)';

    setTimeout(() => {
      element.style.backgroundColor = 'transparent';
      // Add this command to the viewed set
      setViewedFailedCommands(prev => new Set(prev).add(commandId));
    }, 1500);

    // Increment the index for next time
    setCurrentFailedCommandIndex(prev => prev + 1);
  };

  // Count unviewed failed commands
  const unviewedFailedCommandsCount = useMemo(() => {
    let count = 0;
    failedCommandIds.forEach(id => {
      if (!viewedFailedCommands.has(id)) {
        count++;
      }
    });
    return count;
  }, [failedCommandIds, viewedFailedCommands]);

  // Subscribe to logs and commands for real-time updates
  useEffect(() => {
    fetchLogs();
    fetchCommands();

    let logsUnsubscribe: (() => void) | null = null;
    let commandsUnsubscribe: (() => void) | null = null;

    try {
      // Subscribe to logs updates
      const logsPromise = pb.collection('server_logs').subscribe('*', function (e) {
        if (e.action === 'create') {
          setLogs(prev => [...prev, e.record as LogData]);
        }
      });

      // Subscribe to commands updates
      const commandsPromise = pb.collection('server_commands').subscribe('*', function (e) {
        if (e.action === 'create') {
          // Add new command only if it doesn't exist already
          setCommands(prev => {
            if (prev.some(cmd => cmd.id === e.record.id)) {
              return prev;
            }
            return [e.record as unknown as CommandData, ...prev];
          });
        } else if (e.action === 'update') {
          // Update existing command instead of adding a new one
          setCommands(prev => {
            const exists = prev.some(cmd => cmd.id === e.record.id);
            const updatedRecord = e.record as unknown as CommandData;

            // Check if status changed to failed
            if (updatedRecord.status === 'failed') {
              setFailedCommandIds(prev => new Set(prev).add(updatedRecord.id));
            }

            if (exists) {
              return prev.map(cmd =>
                cmd.id === e.record.id ? updatedRecord : cmd
              );
            } else {
              // In case the update comes before we've seen the create
              return [updatedRecord, ...prev];
            }
          });
        }
      });

      // Store the unsubscribe functions once promises resolve
      logsPromise.then(func => {
        logsUnsubscribe = func;
      }).catch(err => {
        const errorMessage = handleError(err, 'establish logs real-time connection');
        setError(errorMessage);
      });

      commandsPromise.then(func => {
        commandsUnsubscribe = func;
      }).catch(err => {
        const errorMessage = handleError(err, 'establish commands real-time connection');
        setError(errorMessage);
      });

      // Cleanup subscriptions on unmount
      return () => {
        if (logsUnsubscribe) logsUnsubscribe();
        if (commandsUnsubscribe) commandsUnsubscribe();
      };
    } catch (err) {
      const errorMessage = handleError(err, 'establish real-time connections');
      setError(errorMessage);
      return () => { }; // Empty cleanup function
    }
  }, [fetchLogs, fetchCommands, handleError]);

  // Handle command submission
  const handleSubmitCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || sendingCommand) return;

    try {
      setSendingCommand(true);
      setError(null);

      // Send command to PocketBase with new status field instead of executed
      const newCommand = await pb.collection('server_commands').create({
        command: command.trim(),
        status: 'sent', // Initial status is 'sent'
      });

      // Clear the input after successful submission
      setCommand('');

      // Add command to local state (it should also come in via subscription)
      setCommands(prev => [newCommand as unknown as CommandData, ...prev]);

      // Scroll to bottom to see the new command
      scrollToBottom();
    } catch (err) {
      const errorMessage = handleError(err, 'send command');
      setError(errorMessage);

      // Log the full error for debugging
      if (err instanceof ClientResponseError) {
        console.error('PocketBase response data:', err.data);
      }
    } finally {
      setSendingCommand(false);
    }
  };

  // Format logs and commands for display
  const renderConsoleContent = () => {
    if (logs.length === 0 && commands.length === 0 && !loading && !error) {
      return <code className={classes.line}>No content available.</code>;
    }

    // Create a combined and sorted array of logs and commands
    const allContent = [
      ...logs.map(log => ({
        id: log.id,
        content: log.log_msg,
        type: 'log' as const,
        timestamp: new Date(log.created),
      })),
      ...commands.map(cmd => ({
        id: cmd.id,
        content: cmd.command,
        type: 'command' as const,
        status: cmd.status,
        timestamp: new Date(cmd.created),
      })),
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Remove potential duplicates by using a Map with composite keys
    const uniqueItems = new Map();
    allContent.forEach(item => {
      const key = `${item.type}-${item.id}-${item.timestamp.getTime()}`;
      uniqueItems.set(key, item);
    });

    return Array.from(uniqueItems.entries()).map(([key, item], index) => {
      if (item.type === 'log') {
        return (
          <code
            key={`log-${item.id}-${index}`}
            className={classes.line}
            style={{
              whiteSpace: 'pre-wrap',
              display: 'block'
            }}
          >
            {item.content}
          </code>
        );
      } else {
        // Command items with new status-based styling and prefixes
        const commandItem = item as typeof item & { status: CommandData['status'] };

        // Define status-specific styles and labels
        const getStatusStyle = (status: CommandData['status']) => {
          switch (status) {
            case 'sent': return 'var(--mantine-color-blue-6)';
            case 'received': return 'var(--mantine-color-yellow-6)';
            case 'executed': return 'var(--mantine-color-green-6)';
            case 'failed': return 'var(--mantine-color-red-6)';
            default: return 'var(--mantine-color-gray-6)';
          }
        };

        const getStatusLabel = (status: CommandData['status']) => {
          switch (status) {
            case 'sent': return '[SENT]';
            case 'received': return '[RECEIVED]';
            case 'executed': return '[EXECUTED]';
            case 'failed': return '[FAILED]';
            default: return '[UNKNOWN]';
          }
        };

        // Create ref callback for failed commands
        const setCommandRef = (element: HTMLElement | null) => {
          if (element && commandItem.status === 'failed') {
            failedCommandRefs.current.set(commandItem.id, element);
          }
        };

        // Check if this failed command has been viewed
        const isViewed = commandItem.status === 'failed' && viewedFailedCommands.has(commandItem.id);

        return (
          <code
            key={`cmd-${item.id}-${index}`}
            className={classes.line}
            ref={setCommandRef}
            style={{
              whiteSpace: 'pre-wrap',
              display: 'block',
              color: getStatusStyle(commandItem.status),
              // Add border for failed commands with different styles for viewed/unviewed
              ...(commandItem.status === 'failed' ? {
                padding: '4px',
                borderRadius: '4px',
                border: isViewed
                  ? '1px dashed var(--mantine-color-red-6)'
                  : '1px solid var(--mantine-color-red-6)',
                backgroundColor: isViewed ? 'transparent' : 'var(--mantine-color-red-0)',
              } : {})
            }}
          >
            {getStatusLabel(commandItem.status)} {commandItem.content}
          </code>
        );
      }
    });
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
          {renderConsoleContent()}
        </Stack>

        {/* Action buttons for scrolling */}
        <div style={{
          position: 'absolute',
          right: 12,
          bottom: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <ActionIcon
            title='Jump to bottom'
            onClick={scrollToBottom}
            variant='white'
            size="xl"
            className={classes.jump}
            style={{ marginBottom: failedCommandIds.size > 0 ? '40px' : '0' }}
          >
            <IconArrowDown className={classes.icon} stroke={1.5} />
          </ActionIcon>

          {failedCommandIds.size > 0 && (
            <Tooltip
              label={
                unviewedFailedCommandsCount > 0
                  ? `${unviewedFailedCommandsCount} unviewed failed command(s). Click to cycle through.`
                  : `All ${failedCommandIds.size} failed command(s) viewed. Click to review again.`
              }
            >
              <ActionIcon
                title='View failed commands'
                onClick={scrollToFailedCommand}
                variant='filled'
                color={unviewedFailedCommandsCount > 0 ? "red" : "gray"}
                size="xl"
                className={classes.failedIndicator}
                style={{ zIndex: 1, marginRight: '13px' }}
              >
                <Badge
                  color={unviewedFailedCommandsCount > 0 ? "red" : "gray"}
                  size="sm"
                  style={{ position: 'absolute', top: -5, right: -5, zIndex: 2 }}
                >
                  {unviewedFailedCommandsCount > 0 ? unviewedFailedCommandsCount : failedCommandIds.size}
                </Badge>
                <IconBell className={classes.icon} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          )}
        </div>
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
          disabled={sendingCommand}
        />
        <ActionIcon
          title='Send'
          size="xl"
          type="submit"
          loading={sendingCommand}
          disabled={!command.trim() || sendingCommand}
        >
          <IconSend className={classes.icon} stroke={1.5} />
        </ActionIcon>
      </form>
    </Stack>
  );
}
