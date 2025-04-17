import { InfractionList } from '@/components/InfractionList/InfractionList';
import { Avatar, Badge, Button, Checkbox, FileInput, Group, LoadingOverlay, Modal, NumberInput, Skeleton, Space, Stack, Tabs, Text, Textarea, Title, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAnalyze, IconArrowBack, IconBrandDiscord, IconBrandMinecraft, IconClipboard, IconMoneybag } from '@tabler/icons-react';

interface UserProfileProps {
  opened: boolean;
  setOpened: (value: boolean) => void;
}

interface UserData {
  avatar: string;
  nickname: string;
  username: string;
  minecraft: string;
  standing: string;
  tribe: string;
}

// This would typically come from an API or props
const userData: UserData = {
  avatar: 'https://images-ext-1.discordapp.net/external/qz4gfnMc9Z4674MjYCSJvpR8yFRdRbsCl2NoatRmv4k/https/cdn.discordapp.com/avatars/505833634134228992/3d9555731affb8dba56ec02071d4f1e7.webp',
  nickname: 'Bog',
  username: 'stonleyfx',
  minecraft: 'BogTheMudWing',
  standing: 'Good',
  tribe: 'MudWing'
};

export function UserProfile({ opened, setOpened }: UserProfileProps) {
  const [modalOpened, { open, close }] = useDisclosure(false);
  const [visible, { toggle }] = useDisclosure(false);

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

  return (
    <div style={{ gridColumn: 1, gridRow: 1 }}>
      <Modal opened={modalOpened} onClose={close} title="New Infraction">
        <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <NumberInput data-autofocus withAsterisk label='Value' description='How many points this infraction is worth.' />
        <Space h="md" />
        <Textarea
          label="Reason"
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
        <Button onClick={toggle}>Create</Button>
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
              Back
            </Button>
            <Space h="md" />
            <Group gap="var(--mantine.spacing.md)">
              <Avatar size="xl" src={userData.avatar} alt="Avatar" />
              <Stack gap={0}>
                <Group gap="var(--mantine-spacing-sm)">
                  <Title order={2}>{userData.nickname}</Title>
                  <Badge color={tribeColors[userData.tribe.toLowerCase()]}>{userData.tribe}</Badge>
                </Group>
                <Group gap="4px">
                  <IconBrandDiscord size={18} color='var(--mantine-color-dimmed)' />
                  <Text size='sm' color='var(--mantine-color-dimmed)'>{userData.username}</Text>
                </Group>
                <Group gap="4px">
                  <IconBrandMinecraft size={18} color='var(--mantine-color-dimmed)' />
                  <Text size='sm' color='var(--mantine-color-dimmed)'>{userData.minecraft}</Text>
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
                  Infractions
                </Tabs.Tab>
                <Tabs.Tab value="economy" leftSection={<IconMoneybag />}>
                  Economy
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="stats">
                <Space h="md" />
                <Skeleton height={8} radius="xl" />
                <Skeleton height={8} mt={6} radius="xl" />
                <Skeleton height={8} mt={6} width="70%" radius="xl" />
              </Tabs.Panel>

              <Tabs.Panel value="infractions">
                <Space h="md" />
                <InfractionList />
                <Space h="md" />
                <Button onClick={open}>New Infraction</Button>
              </Tabs.Panel>

              <Tabs.Panel value="economy">
                <Space h="md" />
                <Text>Economy content goes here</Text>
              </Tabs.Panel>
            </Tabs>
          </div>
        )}
      </Transition>
    </div>
  );
}
