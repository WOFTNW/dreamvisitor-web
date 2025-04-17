import { InfractionList } from '@/components/InfractionList/InfractionList';
import { pb } from '@/lib/pocketbase';
import { User, Infraction, UserInventoryItem } from '@/types/models';
import { Avatar, Badge, Button, Checkbox, FileInput, Group, LoadingOverlay, Modal, NumberInput, Paper, Skeleton, Space, Stack, Tabs, Text, Textarea, Title, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAnalyze, IconArrowBack, IconBrandDiscord, IconBrandMinecraft, IconClipboard, IconCoin, IconMoneybag, IconUser } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';

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

  const tribeColors: Record<string, string> = {
    hivewing: 'orange',
    icewing: 'lightblue',
    leafwing: 'darkgreen',
    mudwing: 'brown',
    nightwing: 'purple',
    rainwing: 'green',
    sandwing: 'yellow',
    seawing: 'blue',
    silkwing: 'pink',
    skywing: 'red',
  };

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
          return
        }
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

  const handleCreateInfraction = async (infractionData: { value: number, reason: string }) => {
    if (!userData || !userId) return;

    try {
      toggleModalLoading();

      await pb.collection('infractions').create({
        reason: infractionData.reason,
        value: infractionData.value,
        user: userData.id,
        expired: false
      });

      // Refresh infractions with a unique cancel key
      const updatedUser = await pb.collection('users').getOne(userId, {
        expand: 'infractions',
        $cancelKey: `refresh-infractions-${Date.now()}`,
      });

      if (updatedUser.expand?.infractions) {
        setInfractions(updatedUser.expand.infractions as unknown as Infraction[]);
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

  // For demonstration, we'll keep the static avatar and use dynamic data for the rest
  const avatarUrl = 'https://images-ext-1.discordapp.net/external/qz4gfnMc9Z4674MjYCSJvpR8yFRdRbsCl2NoatRmv4k/https/cdn.discordapp.com/avatars/505833634134228992/3d9555731affb8dba56ec02071d4f1e7.webp';

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
          handleCreateInfraction({ value, reason });
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
          <FileInput
            label="Proof"
            description="Attach a proof file"
            placeholder="Input placeholder"
          />
          <Space h="md" />
          <Checkbox label="Send a warn message" description='Whether to notify the user they have been warned.' defaultChecked />
          <Space h="md" />
          <Checkbox label="Include proof in message" description='Whether to include the proof file in the warn message.' defaultChecked />
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
                  <Avatar size="xl" src={avatarUrl} alt="Avatar" />
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
                    <Space h="md" />
                    <Paper p="md" withBorder>
                      {infractions.length > 0 ? (
                        infractions.map(infraction => (
                          <Paper key={infraction.id} p="sm" withBorder mb="sm">
                            <Group justify="space-between">
                              <Text fw={700}>Points: {infraction.value}</Text>
                              <Badge color={infraction.expired ? "gray" : "red"}>
                                {infraction.expired ? "Expired" : "Active"}
                              </Badge>
                            </Group>
                            <Text>{infraction.reason || "No reason provided"}</Text>
                            <Text size="xs" c="dimmed">Issued on: {new Date(infraction.created).toLocaleString()}</Text>
                          </Paper>
                        ))
                      ) : (
                        <Text>No infractions found</Text>
                      )}
                    </Paper>
                    <Space h="md" />
                    <Button onClick={open}>New Infraction</Button>
                  </Tabs.Panel>

                  <Tabs.Panel value="economy">
                    <Space h="md" />
                    <Paper p="md" withBorder mb="md">
                      <Title order={4} mb="md">Economy Overview</Title>
                      <Group align="center" gap="xs" mb="sm">
                        <IconCoin size={20} />
                        <Text fw={700}>Balance: {userData.balance}</Text>
                      </Group>
                      <Text><strong>Daily Streak:</strong> {userData.daily_streak}</Text>
                      <Text><strong>Last Daily Claim:</strong> {new Date(userData.last_daily).toLocaleString()}</Text>
                      <Text><strong>Last Work:</strong> {new Date(userData.last_work).toLocaleString()}</Text>
                    </Paper>

                    <Paper p="md" withBorder>
                      <Title order={4} mb="md">Inventory ({inventory.length} items)</Title>
                      {inventory.length > 0 ? (
                        inventory.map(invItem => {
                          const item = invItem.expand?.item;
                          return (
                            <Paper key={invItem.id} p="sm" withBorder mb="sm">
                              <Group justify="space-around">
                                <Text fw={700}>{item?.name || "Unknown Item"}</Text>
                                <Badge>Qty: {invItem.quantity}</Badge>
                              </Group>
                              <Text size="sm">{item?.description || "No description"}</Text>
                              <Group mt="xs">
                                <Text size="xs" c="dimmed">Value: {item?.price || 0}</Text>
                                {item?.sale_percent ? (
                                  <Badge color="green">Sale: {item.sale_percent}% off</Badge>
                                ) : null}
                              </Group>
                            </Paper>
                          );
                        })
                      ) : (
                        <Text>No items in inventory</Text>
                      )}
                    </Paper>
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
