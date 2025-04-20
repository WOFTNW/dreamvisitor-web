import { InfractionList } from '@/components/InfractionList/InfractionList';
import { pb } from '@/lib/pocketbase';
import { User, Infraction, UserInventoryItem } from '@/types/models';
import { Avatar, Badge, Button, Checkbox, FileInput, Group, LoadingOverlay, Modal, NumberInput, Paper, Skeleton, Space, Stack, Tabs, Text, Textarea, Title, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAnalyze, IconArrowBack, IconBrandDiscord, IconBrandMinecraft, IconClipboard, IconCoin, IconMoneybag, IconUser } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
import { EconomyTab } from './EconomyTab';
import { InfractionsTab } from './InfractionsTab';

interface UserProfileProps {
  opened: boolean;
  setOpened: (value: boolean) => void;
  userId?: string | null; // Make userId truly optional
}

export function UserProfile({ opened, setOpened, userId }: UserProfileProps) {
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [modalLoading, { toggle: toggleModalLoading }] = useDisclosure(false);
  const previousUserIdRef = useRef<string | null | undefined>(null);
  const isCurrentlyFetchingRef = useRef(false);

  // Fetch user data only when userId changes or the component becomes visible
  useEffect(() => {
    // Skip if the userId hasn't changed or we're already fetching
    if (userId === previousUserIdRef.current || isCurrentlyFetchingRef.current) {
      return;
    }

    // Update the ref to the current userId
    previousUserIdRef.current = userId;

    // Only fetch if we have a userId and the component is visible
    if (!opened || !userId) {
      if (!userId) {
        // Reset states when userId becomes null
        setUserData(null);
        setInfractions([]);
        setInventory([]);
        setError(null);
      }
      return;
    }

    async function fetchUserData() {
      try {
        setLoading(true);
        isCurrentlyFetchingRef.current = true;
        setError(null);
        if (!userId) {
          console.error('Failed to fetch user data:');
          setError('Failed to load user data. Please try again later.');
          return;
        }

        // Modify the expand parameter to include a higher limit for infractions if needed
        const user = await pb.collection('users').getOne(userId, {
          expand: 'infractions,inventory_items.item',
          $cancelKey: `user-profile-${userId}`,
        });

        setUserData(user as unknown as User);

        // Extract expanded relations
        if (user.expand?.infractions) {
          setInfractions(user.expand.infractions as unknown as Infraction[]);
        } else {
          setInfractions([]);
        }

        if (user.expand?.inventory_items) {
          setInventory(user.expand.inventory_items as unknown as UserInventoryItem[]);
        } else {
          setInventory([]);
        }
      } catch (err) {
        // Don't show errors for cancelled requests
        if (err instanceof Error && (err.name === 'AbortError' || (err as any).isAbort)) {
          console.log('Request was aborted', err);
          return;
        }

        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
        isCurrentlyFetchingRef.current = false;
      }
    }

    fetchUserData();
  }, [opened, userId]);

  const handleCreateInfraction = async (infractionData: { value: number, reason: string, sendWarnning?: boolean }) => {
    if (!userData || !userId) return;

    try {
      toggleModalLoading();

      await pb.collection('infractions').create({
        reason: infractionData.reason,
        value: infractionData.value,
        send_warning: infractionData.sendWarnning,
        user: userData.id,
        expired: false,
      });

      // Modify the expand parameter to include a higher limit for infractions if needed
      const user = await pb.collection('users').getOne(userId, {
        expand: 'infractions,inventory_items.item',
        $cancelKey: `user-profile-${userId}`,
      });

      setUserData(user as unknown as User);

      // Extract expanded relations
      if (user.expand?.infractions) {
        setInfractions(user.expand.infractions as unknown as Infraction[]);
      } else {
        setInfractions([]);
      }
      close();
    } catch (err) {
      console.error('Failed to create infraction:', err);
    } finally {
      toggleModalLoading();
    }
  };

  // Show a message when no user is selected
  if (opened && !userId) {
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
              <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
                <IconUser size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <Title order={3} mb="md">No User Selected</Title>
                <Text size="md" c="dimmed" mb="xl">
                  Please select a user from the list to view their details.
                </Text>
                <Button onClick={() => setOpened(true)}>
                  View User List
                </Button>
              </Paper>
            </div>
          )}
        </Transition>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ gridColumn: 1, gridRow: 1 }}>
        <LoadingOverlay visible={true} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      </div>
    );
  }

  if (error || (opened && userId && !userData)) {
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
              <Paper p="md" withBorder>
                <Text color="red">{error || 'Error: User not found'}</Text>
                <Button mt="md" onClick={() => setOpened(true)}>
                  Back to User List
                </Button>
              </Paper>
            </div>
          )}
        </Transition>
      </div>
    );
  }

  // Rest of the component renders user data when available
  return (
    <div style={{ gridColumn: 1, gridRow: 1 }}>
      <Modal opened={modalOpened} onClose={close} title="New Infraction">
        <LoadingOverlay visible={modalLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const value = Number(formData.get('value'));
          const reason = formData.get('reason') as string;
          const sendWarnning = Boolean(formData.get("send_warning"));
          handleCreateInfraction({ value, reason, sendWarnning });
        }}>
          <NumberInput
            data-autofocus
            withAsterisk
            label='Value'
            name="value"
            description='How many points this infraction is worth.'
            defaultValue={1}
            min={1}
          />
          <Space h="md" />
          <Textarea
            label="Reason"
            name="reason"
            description="(Optional) Add a reason for this infraction."
          />
          <Space h="md" />
          <Checkbox
            name='send_warning'
            label="Send a warn message"
            description='Whether to notify the user they have been warned.'
            defaultChecked
          />
          <Space h="md" />
          <Button type="submit">Create</Button>
        </form>
      </Modal>

      <Transition
        mounted={opened}
        transition="fade-up"
        duration={400}
        timingFunction="ease"
        enterDelay={250}
      >
        {(styles) => (
          <div style={styles}>
            <Button variant='subtle' leftSection={<IconArrowBack />} onClick={() => setOpened(true)}>
              Back to User List
            </Button>
            <Space h="md" />
            {userData && (
              <>
                <Group gap="var(--mantine.spacing.md)">
                  {/* TODO: Fetch This From Pocketbase */}
                  <Avatar size="xl" src={pb.files.getURL(userData, userData.discord_img)} alt="Avatar" />
                  <Stack gap={0}>
                    <Group gap="var(--mantine-spacing-sm)">
                      <Title order={2}>{userData.discord_id}</Title>
                      <Badge color={userData.is_banned ? "red" : userData.is_suspended ? "orange" : "green"}>
                        {userData.is_banned ? "Banned" : userData.is_suspended ? "Suspended" : "Active"}
                      </Badge>
                    </Group>
                    <Group gap="4px">
                      <IconBrandDiscord size={18} color='var(--mantine-color-dimmed)' />
                      <Text size='sm' color='var(--mantine-color-dimmed)'>{userData.discord_id}</Text>
                    </Group>
                    <Group gap="4px">
                      <IconBrandMinecraft size={18} color='var(--mantine-color-dimmed)' />
                      <Text size='sm' color='var(--mantine-color-dimmed)'>{userData.mc_username}</Text>
                    </Group>
                  </Stack>
                </Group>
                <Space h="md" />
                <Tabs defaultValue="stats">
                  <Tabs.List>
                    <Tabs.Tab value="stats" leftSection={<IconAnalyze />}>
                      Stats
                    </Tabs.Tab>
                    <Tabs.Tab value="infractions" leftSection={<IconClipboard />}>
                      Infractions ({infractions.length})
                    </Tabs.Tab>
                    <Tabs.Tab value="economy" leftSection={<IconMoneybag />}>
                      Economy
                    </Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="stats">
                    <Space h="md" />
                    <Paper p="md" withBorder>
                      <Group mb="md">
                        <Title order={4}>User Information</Title>
                      </Group>
                      <Text><strong>Account Created:</strong> {new Date(userData.created).toLocaleString()}</Text>
                      <Text><strong>Last Updated:</strong> {new Date(userData.updated).toLocaleString()}</Text>
                      <Text><strong>Account Status:</strong> {userData.is_banned ? "Banned" : userData.is_suspended ? "Suspended" : "Active"}</Text>
                    </Paper>
                  </Tabs.Panel>

                  <Tabs.Panel value="infractions">
                    <InfractionsTab
                      infractions={infractions}
                      onNewInfraction={open}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="economy">
                    <EconomyTab
                      userData={userData}
                      inventory={inventory}
                    />
                  </Tabs.Panel>
                </Tabs>
              </>
            )}
          </div>
        )}
      </Transition>
    </div>
  );
}
