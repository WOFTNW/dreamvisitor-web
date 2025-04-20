import { DiscordUserTable } from '@/components/DiscordUserTable/DiscordUserTable';
import { pb, cancelableFetch } from '@/lib/pocketbase';
import { User } from '@/types/models';
import { CloseButton, LoadingOverlay, Paper, Space, Text, TextInput, Transition } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useState, useRef, useCallback } from 'react';

interface UserTableProps {
  opened: boolean;
  setOpened: (value: boolean) => void;
  setSelectedUserId: (id: string) => void;
}

export function UserTable({ opened, setOpened, setSelectedUserId }: UserTableProps) {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const fetchIdRef = useRef(0); // To track the most recent fetch request

  // Single useEffect for handling all data fetching scenarios
  useEffect(() => {
    // Only fetch on initial mount or when opened changes from false to true
    if (isInitialMount.current || (opened && !isInitialMount.current)) {
      fetchUsers();
      isInitialMount.current = false;
    }
  }, [opened]);

  // Separate effect for handling search
  useEffect(() => {
    if (!isInitialMount.current && opened) {
      fetchUsers(debouncedSearch);
    }
  }, [debouncedSearch, opened]);

  const fetchUsers = useCallback(async (search?: string) => {
    // Generate a unique ID for this fetch request
    const currentFetchId = ++fetchIdRef.current;

    try {
      setLoading(true);
      setError(null);

      let filter = '';
      if (search) {
        filter = `discord_id ~ "${search}" || mc_username ~ "${search}"`;
      }

      // Use the utility function to make a cancellable fetch
      const { promise } = cancelableFetch(`users-${currentFetchId}`, () =>
        pb.collection('users').getList(1, 50, {
          filter,
          sort: '-updated',
        })
      );

      const records = await promise;

      // Only update state if this is still the most recent fetch
      if (currentFetchId === fetchIdRef.current) {
        setUsers(records.items as unknown as User[]);
      }
    } catch (err) {
      // Only set error if this is still the most recent fetch
      if (currentFetchId === fetchIdRef.current) {
        // Check if this is a cancellation error (we can safely ignore it)
        const errorObj = err as any;
        if (
          errorObj?.isAbort ||
          errorObj?.name === 'AbortError' ||
          (errorObj?.status === 0 && errorObj?.message?.includes('autocancelled'))
        ) {
          console.log('Request was cancelled, ignoring error');
          return;
        }

        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
      }
    } finally {
      // Only update loading state if this is still the most recent fetch
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // The actual API call will be triggered by the debounced effect
  };

  return (
    <div style={{ gridColumn: 1, gridRow: 1 }}>
      <Transition
        mounted={opened}
        transition="fade-up"
        duration={400}
        timingFunction="ease"
        enterDelay={250}
      >
        {(styles) => (
          <div style={styles}>
            <Space h="md" />
            <TextInput
              leftSectionPointerEvents="none"
              leftSection={<IconSearch />}
              placeholder="Search by username or Minecraft name"
              value={searchValue}
              onChange={(event) => handleSearch(event.currentTarget.value)}
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => handleSearch('')}
                  style={{ display: searchValue ? undefined : 'none' }}
                />
              }
            />

            <div style={{ position: 'relative', minHeight: '200px' }}>
              <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

              {error ? (
                <Paper p="md" withBorder mt="md">
                  <Text color="red">{error}</Text>
                </Paper>
              ) : users.length === 0 && !loading ? (
                <Paper p="md" withBorder mt="md" ta="center">
                  <Text>No users found</Text>
                </Paper>
              ) : (
                <DiscordUserTable
                  setOpened={setOpened}
                  users={users}
                  onUserSelect={setSelectedUserId}
                />
              )}
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}
