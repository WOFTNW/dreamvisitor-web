import { DiscordUserTable } from '@/components/DiscordUserTable/DiscordUserTable';
import { InfractionList } from '@/components/InfractionList/InfractionList';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { Avatar, Button, Center, Checkbox, Group, Modal, NumberInput, rem, SegmentedControl, Skeleton, Space, Stack, Tabs, Text, Textarea, TextInput, Title, Transition } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAnalyze, IconArrowBack, IconBrandDiscord, IconBrandMinecraft, IconClipboard, IconMoneybag, IconSearch } from '@tabler/icons-react';
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
                <Space h="md" />
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

    const [modalOpened, { open, close }] = useDisclosure(false);

    return (
        <div style={{ gridColumn: 1, gridRow: 1 }}>
            <Modal opened={modalOpened} onClose={close} title="New Infraction">
                <NumberInput data-autofocus withAsterisk label='Value' description='How many points this infraction is worth.'/>
                <Space h="md" />
                <Textarea
                    label="Reason"
                    description="(Optional) Add a reason for this infraction."
                />
                <Space h="md" />
                <Checkbox label="Send a warn message" description='Whether to notify the user they have been warned.' defaultChecked />
                <Space h="md" />
                <Button>Create</Button>
                
            </Modal>

            <Transition
                mounted={opened}
                transition="fade-up"
                duration={400}
                timingFunction="ease"
                enterDelay={250}
            >{(styles) => <div style={styles}>
                <Button variant='subtle' leftSection={<IconArrowBack />} onClick={opened == !opened}>
                    Back
                </Button>
                <Space h="md" />
                <Group gap="var(--mantine.spacing.md)">
                    <Avatar size="xl" src="https://images-ext-1.discordapp.net/external/qz4gfnMc9Z4674MjYCSJvpR8yFRdRbsCl2NoatRmv4k/https/cdn.discordapp.com/avatars/505833634134228992/3d9555731affb8dba56ec02071d4f1e7.webp" alt="Avatar" />
                    <Stack gap={0}>
                        <Title order={2}>Bog</Title>
                        <Group gap="4px">
                            <IconBrandDiscord size={18} color='var(--mantine-color-dimmed)' />
                            <Text size='sm' color='var(--mantine-color-dimmed)'>stonleyfx</Text>
                        </Group>
                        <Group gap="4px">
                            <IconBrandMinecraft size={18} color='var(--mantine-color-dimmed)' />
                            <Text size='sm' color='var(--mantine-color-dimmed)'>BogTheMudWing</Text>
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

    const [opened] = useState(false);

    return (

        <>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <NavbarSimple page="Users" />
                <div style={{ margin: 'var(--mantine-spacing-xl)', width: '100%' }}>
                    {/* <Button onClick={() => setOpened(!opened)}>Toggle</Button> */}
                    <div style={{ display: 'grid' }}>
                        <UserProfile opened={!opened} />
                        <Table opened={opened} />
                    </div>
                </div>
            </div>
        </>
    );
}
