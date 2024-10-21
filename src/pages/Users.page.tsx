import { DiscordUserTable } from '@/components/DiscordUserTable/DiscordUserTable';
import { InfractionList } from '@/components/InfractionList/InfractionList';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { Avatar, Button, Center, Divider, Group, Modal, rem, SegmentedControl, Space, Stack, Tabs, Text, TextInput, Title, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAnalyze, IconBrandDiscord, IconBrandMinecraft, IconClipboard, IconMoneybag, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

function Table({ opened }: { opened: boolean }) {
    return (
        <div style={{ gridColumn: 1, gridRow: 1 }}>
            <Transition
                mounted={opened}
                transition="fade-up"
                duration={400}
                timingFunction="ease"
                enterDelay={250}
            >{(styles) => <div style={styles}>
                <SegmentedControl fullWidth data={[
                    {
                        value: 'minecraft',
                        label: (
                            <Center style={{ gap: 10 }}>
                                <IconBrandMinecraft style={{ width: rem(16), height: rem(16) }} />
                                <span>Minecraft</span>
                            </Center>
                        ),
                    },
                    {
                        value: 'discord',
                        label: (
                            <Center style={{ gap: 10 }}>
                                <IconBrandDiscord style={{ width: rem(16), height: rem(16) }} />
                                <span>Discord</span>
                            </Center>
                        )
                    }]} defaultValue='minecraft' />
                <Space h={'md'} />
                <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={<IconSearch />}
                    placeholder="Search by username"
                />
                <DiscordUserTable />
            </div>}
            </Transition>
        </div>
    )
}

function UserProfile({ opened }: { opened: boolean }) {
    return (
        <div style={{ gridColumn: 1, gridRow: 1 }}>
            <Transition
                mounted={opened}
                transition="fade-up"
                duration={400}
                timingFunction="ease"
                enterDelay={250}
            >{(styles) => <div style={styles}>
                <Group gap={'var(--mantine.spacing.md)'}>
                    <Avatar size={'xl'} src="https://images-ext-1.discordapp.net/external/qz4gfnMc9Z4674MjYCSJvpR8yFRdRbsCl2NoatRmv4k/https/cdn.discordapp.com/avatars/505833634134228992/3d9555731affb8dba56ec02071d4f1e7.webp" alt="Avatar" />
                    <Stack gap={0}>
                        <Title order={2}>Bog</Title>
                        <Group gap={'4px'}>
                            <IconBrandDiscord size={18} color='var(--mantine-color-dimmed)' />
                            <Text size='sm' color='var(--mantine-color-dimmed)'>stonleyfx</Text>
                        </Group>
                        <Group gap={'4px'}>
                            <IconBrandMinecraft size={18} color='var(--mantine-color-dimmed)' />
                            <Text size='sm' color='var(--mantine-color-dimmed)'>BogTheMudWing</Text>
                        </Group>
                    </Stack>
                </Group>
                <Space h={'md'} />
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
                        Gallery tab content
                    </Tabs.Panel>

                    <Tabs.Panel value="infractions">
                        <Space h={'md'} />
                        <InfractionList />
                    </Tabs.Panel>

                    <Tabs.Panel value="economy  ">
                        Settings tab content
                    </Tabs.Panel>
                </Tabs>
            </div>}
            </Transition>
        </div>
    )
}

export function UsersPage() {

    const [opened, setOpened] = useState(false);

    return (

        <>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <NavbarSimple page={"Users"} />
                <div style={{ margin: 'var(--mantine-spacing-md)', width: '100%' }}>
                    <Title order={1}>User Manager</Title>
                    <Text>Manage everything about users.</Text>
                    <Space h={'md'} />
                    <Divider />
                    <Space h={'md'} />

                    {/* <Button onClick={() => setOpened(!opened)}>Toggle</Button> */}
                    <div style={{ display: 'grid' }}>
                        <UserProfile opened={!opened} />
                        <Table opened={opened}></Table>
                    </div>
                </div>
            </div>
        </>
    );
}
