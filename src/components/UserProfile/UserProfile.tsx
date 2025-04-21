import { InfractionList } from '@/components/InfractionList/InfractionList';
import { pb } from '@/lib/pocketbase';
import { User, Infraction, UserInventoryItem, UserHome, Location } from '@/types/models';
import { Avatar, Badge, Button, Checkbox, FileInput, Group, LoadingOverlay, Modal, NumberInput, Paper, Skeleton, Space, Stack, Tabs, Text, Textarea, Title, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAnalyze, IconArrowBack, IconBrandDiscord, IconBrandMinecraft, IconClipboard, IconCoin, IconMoneybag, IconUser, IconHome, IconMap } from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
import { EconomyTab } from './EconomyTab';
import { InfractionsTab } from './InfractionsTab';

interface UserProfileProps {
  opened: boolean;
  setOpened: (value: boolean) => void;
  userId?: string | null; // Make userId truly optional
}

// Helper function to format time
const formatPlayTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return `${days}d ${remainingHours}h ${remainingMinutes}m`;
};

export function UserProfile({ opened, setOpened, userId }: UserProfileProps) {
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [editingInfraction, setEditingInfraction] = useState<Infraction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [inventory, setInventory] = useState<UserInventoryItem[]>([]);
  const [homes, setHomes] = useState<UserHome[]>([]);
  const [claims, setClaims] = useState<Location[]>([]);
  const [modalLoading, setModalLoading] = useState(false); // Changed from useDisclosure to direct state
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
        setHomes([]);
        setClaims([]);
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
          expand: 'infractions,inventory_items.item,users_home.location,claims',
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

        if (user.expand?.users_home) {
          setHomes(user.expand.users_home as unknown as UserHome[]);
        } else {
          setHomes([]);
        }

        if (user.expand?.claims) {
          setClaims(user.expand.claims as unknown as Location[]);
        } else {
          setClaims([]);
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
  function calClaims(claims: Location[]) {
    let sum = 0
    claims.map(claim => {
      // to avoid multiplaction with zero
      sum += Math.max(1, Math.abs(claim.x)) * Math.max(1, Math.abs(claim.z))
    })
    return sum
  }
  const handleCreateInfraction = async (infractionData: { value: number, reason: string, sendWarnning?: boolean }) => {
    if (!userData || !userId) return;

    try {
      setModalLoading(true); // Use direct setState instead of toggle

      await pb.collection('infractions').create({
        reason: infractionData.reason,
        value: infractionData.value,
        send_warning: infractionData.sendWarnning,
        user: userData.id,
        expired: false,
      });

      // Modify the expand parameter to include a higher limit for infractions if needed
      const user = await pb.collection('users').getOne(userId, {
        expand: 'infractions,inventory_items.item,users_home.location,claims',
        $cancelKey: `user-profile-${userId}`,
      });

      setUserData(user as unknown as User);

      // Extract expanded relations
      if (user.expand?.infractions) {
        setInfractions(user.expand.infractions as unknown as Infraction[]);
      } else {
        setInfractions([]);
      }

      setModalLoading(false); // Set loading to false before closing modal
      close();
    } catch (err) {
      console.error('Failed to create infraction:', err);
      setModalLoading(false); // Ensure loading is set to false on error
    }
  };

  const handleEditInfraction = async (infractionData: {
    value: number,
    reason: string,
    expired: boolean,
    sendWarning?: boolean
  }) => {
    if (!editingInfraction || !userData || !userId) return;

    try {
      setModalLoading(true); // Use direct setState instead of toggle

      await pb.collection('infractions').update(editingInfraction.id, {
        reason: infractionData.reason,
        value: infractionData.value,
        expired: infractionData.expired,
        send_warning: infractionData.sendWarning,
      });

      // Refetch user data to update the UI
      const user = await pb.collection('users').getOne(userId, {
        expand: 'infractions,inventory_items.item,users_home.location,claims',
        $cancelKey: `user-profile-${userId}`,
      });

      setUserData(user as unknown as User);

      // Extract expanded relations
      if (user.expand?.infractions) {
        setInfractions(user.expand.infractions as unknown as Infraction[]);
      } else {
        setInfractions([]);
      }

      setModalLoading(false); // Set loading to false before closing modal
      closeEditModal();
    } catch (err) {
      console.error('Failed to update infraction:', err);
      setModalLoading(false); // Ensure loading is set to false on error
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

      {/* Edit Infraction Modal */}
      <Modal opened={editModalOpened} onClose={closeEditModal} title="Edit Infraction">
        <LoadingOverlay visible={modalLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const value = Number(formData.get('value'));
          const reason = formData.get('reason') as string;
          const expired = Boolean(formData.get("expired"));
          const sendWarnning = Boolean(formData.get("send_warning"));
          handleEditInfraction({ value, reason, expired, sendWarning: sendWarnning });
        }}>
          <NumberInput
            data-autofocus
            withAsterisk
            label='Value'
            name="value"
            description='How many points this infraction is worth.'
            defaultValue={editingInfraction?.value}
            min={1}
          />
          <Space h="md" />
          <Textarea
            label="Reason"
            name="reason"
            description="(Optional) Add a reason for this infraction."
            defaultValue={editingInfraction?.reason}
          />
          <Space h="md" />
          <Checkbox
            name='expired'
            label="Mark as expired"
            description='Whether this infraction is expired.'
            defaultChecked={editingInfraction?.expired}
          />
          <Space h="md" />
          <Button type="submit">Update</Button>
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
                    <Tabs.Tab value="locations" leftSection={<IconMap />}>
                      Locations
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
                      <Text><strong>Play Time:</strong> {formatPlayTime(userData.play_time || 0)}</Text>
                    </Paper>
                  </Tabs.Panel>

                  <Tabs.Panel value="infractions">
                    <InfractionsTab
                      infractions={infractions}
                      onNewInfraction={open}
                      onEditInfraction={(infraction) => {
                        setEditingInfraction(infraction);
                        openEditModal();
                      }}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="economy">
                    <EconomyTab
                      userData={userData}
                      inventory={inventory}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="locations">
                    <Space h="md" />
                    <Paper p="md" withBorder mb="md">
                      <Title order={4} mb="md">Home Locations</Title>
                      {homes.length > 0 ? (
                        homes.map(home => {
                          const location = home.expand?.location;
                          return (
                            <Paper key={home.id} p="sm" withBorder mb="sm">
                              <Group>
                                <Group>
                                  <IconHome size={18} />
                                  <Text fw={700}>{home.name}</Text>
                                </Group>
                                <Text size="sm">Created: {new Date(home.created).toLocaleString()}</Text>
                              </Group>
                              {location && (
                                <Text size="sm" mt="xs">
                                  Location: {location.world} ({Math.round(location.x)}, {Math.round(location.y)}, {Math.round(location.z)})
                                </Text>
                              )}
                            </Paper>
                          );
                        })
                      ) : (
                        <Text>No home locations set</Text>
                      )}
                    </Paper>

                    <Paper p="md" withBorder>
                      <Group>
                        <Title order={4} mb="md">Land Claims</Title>
                        <Badge size="lg">{calClaims(claims)} / {userData.claim_limit || 0}</Badge>
                      </Group>

                      {claims.length > 0 ? (
                        claims.map(claim => (
                          <Paper key={claim.id} p="sm" withBorder mb="sm">
                            <Group>
                              <IconMap size={18} />
                              <Text>
                                {claim.world} ({Math.round(claim.x)}, {Math.round(claim.y)}, {Math.round(claim.z)})
                              </Text>
                            </Group>
                          </Paper>
                        ))
                      ) : (
                        <Text>No land claims</Text>
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
