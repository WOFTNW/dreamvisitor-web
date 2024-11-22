import { LocationInput } from '@/components/LocationInput/LocationInput';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { SelectCategory } from '@/components/SelectGroupsSearchable/SelectCategory';
import { SelectChannel } from '@/components/SelectGroupsSearchable/SelectChannel';
import { SelectGroup } from '@/components/SelectGroupsSearchable/SelectGroup';
import { SelectRole } from '@/components/SelectGroupsSearchable/SelectRole';
import { ActionIcon, Alert, Button, Card, Checkbox, Divider, Fieldset, Grid, Group, NumberInput, Paper, PasswordInput, Space, Switch, Tabs, Text, Textarea, TextInput, Title, Transition } from '@mantine/core';
import { IconServer, IconTool, IconInfoCircle, IconMoneybag, IconTrash, IconAdjustments, IconX } from '@tabler/icons-react';
import { useState } from 'react';

const ecoItems =
    [
        {
            useDisabled: false,
            onUseGroupsAdd: [],
            maxAllowed: -1,
            quantity: -1,
            onUseConsoleCommands: [],
            giftingEnabled: true,
            description: "Get exclusive content!",
            enabled: true,
            onUseRolesRemove: [],
            price: 10000.0,
            name: "Insider Perks Tier 1",
            salePercent: 0.0,
            useOnPurchase: false,
            onUseRolesAdd: [],
            id: 31464872,
            onUseGroupsRemove: [],
        },
        {
            useDisabled: true,
            onUseGroupsAdd: [],
            maxAllowed: 5,
            quantity: 10,
            onUseConsoleCommands: [],
            giftingEnabled: false,
            description: "Another exclusive content tier!",
            enabled: false,
            onUseRolesRemove: [],
            price: 20000.0,
            name: "Insider Perks Tier 2",
            salePercent: 10.0,
            useOnPurchase: true,
            onUseRolesAdd: [],
            id: 31464873,
            onUseGroupsRemove: [],
        }
    ];

// Template for a new item
const newItemTemplate = {
    useDisabled: false,
    onUseGroupsAdd: [],
    maxAllowed: -1,
    quantity: -1,
    onUseConsoleCommands: [],
    giftingEnabled: true,
    description: "A new shiny item!",
    enabled: true,
    onUseRolesRemove: [],
    price: 0.0,
    name: "New Item",
    salePercent: 0.0,
    useOnPurchase: false,
    onUseRolesAdd: [],
    id: Date.now(),  // Generate a unique ID using the current timestamp
    onUseGroupsRemove: [],
};

export function ConfigPage() {
    const space = "md";

    const [items, setItems] = useState(ecoItems);

    const handleInputChange = (index: number, field: string, value: any) => {
        const updatedItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        setItems(updatedItems);
    };

    const addItem = () => {
        setItems((prevItems) => [...prevItems, { ...newItemTemplate, id: Date.now() }]);
    };

    const deleteItem = (id: number) => {
        setItems((prevItems) => prevItems.filter(item => item.id !== id))
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <NavbarSimple page="Configuration" />
                <div style={{ margin: 'var(--mantine-spacing-xl)', width: '100%' }}>
                    <Tabs defaultValue="server">
                        <Tabs.List>
                            <Tabs.Tab value="server" leftSection={<IconServer />}>
                                Server
                            </Tabs.Tab>
                            <Tabs.Tab value="dreamvisitor" leftSection={<IconTool />}>
                                Dreamvisitor
                            </Tabs.Tab>
                            <Tabs.Tab value="economy" leftSection={<IconMoneybag />}>
                                Economy
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="server">
                            <Space h={space} />
                            <Title order={2}>Server Configuration</Title>
                            <Text size="md">Configure the PaperMC server.</Text>
                            <Space h={space} />
                            <Button>Apply</Button>
                        </Tabs.Panel>

                        <Tabs.Panel value="dreamvisitor">
                            <Space h={space} />
                            <Title order={2}>Dreamvisitor Configuration</Title>
                            <Text size="md">Configure Dreamvisitor.</Text>
                            <Space h={space} />
                            <Divider />
                            <Space h={space} />
                            <Checkbox label='Debug Mode' description='Whether to enable debug messages. This will send additional messages to help debug Dreamvisitor. Disabled by default.' />
                            <Space h={space} />
                            <Checkbox label='Pause Chat' description='Whether chat is paused or not. This can be toggled in Minecraft with /pausechat. Disabled by default.' />
                            <Space h={space} />
                            <Checkbox label='Soft Whitelist' description='Whether the soft whitelist is enabled or not. This can be set in Minecraft with /softwhitelist [on|off]. Disabled by default.' />
                            <Space h={space} />
                            <Checkbox label='Disable PvP' description='Whether to globally disable pvp or not. This can be toggled in Minecraft with /togglepvp.' />
                            <Space h={space} />
                            <NumberInput label='Player Limit Override' description='Player limit override. This will override the player limit, both over and under. This can be set in Minecraft with /playerlimit <int>' />
                            <Space h={space} />
                            <TextInput label='Resource Pack Repository' placeholder='WOFTNW/Dragonspeak' description='The repository path of the server resource pack. Dreamvisitor will pull the first artifact from the latest release on pack update.' />
                            <Space h={space} />
                            <LocationInput label='Hub Location' />
                            <Space h={space} />
                            <Fieldset legend="Bot">
                                <PasswordInput label='Bot Token' description='The Dreamvisitor bot token. DO NOT SHARE THIS. Dreamvisitor will not work properly unless this is a valid bot token. Ask Bog for a bot token if Dreamvisitor reports a login error on startup.' />
                                <Space h={space} />
                                <Alert variant="light" color="blue" radius="md" title="Sensitive information" icon=<IconInfoCircle />>
                                    The Dreamvisitor bot token allows programs to control the Dreamvisitor bot. A malicious program with the token would be granted all permissions that Dreamvisitor bot has. Only DreamvisitorHub should be allowed to operate Dreamvisitor bot. Do not reveal or change this value unless the bot token is invalid.
                                </Alert>
                                <Space h={space} />
                                <SelectChannel label='Whitelist Channel' description='The channel of the whitelist chat. This can be set on Discord with /setwhitelist.' />
                                <Space h={space} />
                                <SelectChannel label='Game Chat Channel' description='The channel of the game chat. This can be set on Discord with /setgamechat.' />
                                <Space h={space} />
                                <SelectChannel label='Log Channel' description='The channel of the log chat. This can be set on Discord with /setlogchat.' />
                                <Space h={space} />
                                <Checkbox label='Log Console' description='Whether to copy the output of the console to the Discord log channel. This will disable the default Dreamvisitor logging in place of the Minecraft server console.' />
                                <Space h={space} />
                                <Checkbox label='Enable Log Console Commands' description='Whether to pass messages in the log channel as console commands. If log-console is enabled, this will take messages sent by users with the Discord administrator permission and pass them as console commands.' />
                            </Fieldset>
                            <Space h={space} />
                            <Fieldset legend="Web Whitelist">
                                <Checkbox label='Web Whitelist' description='Whether web whitelisting is enabled or not. This can be set with the /toggleweb Discord command. Enabled by default.' />
                                <Space h={space} />
                                <TextInput label='Website URL' placeholder='https://woftnw.org' description='The URL for the whitelisting website. Used to restrict requests not from the specified website to prevent abuse.' />
                            </Fieldset>
                            <Space h={space} />
                            <Fieldset legend="Tribe Roles">
                                <SelectRole label='HiveWing Role' />
                                <Space h={space} />
                                <SelectRole label='IceWing Role' />
                                <Space h={space} />
                                <SelectRole label='LeafWing Role' />
                                <Space h={space} />
                                <SelectRole label='MudWing Role' />
                                <Space h={space} />
                                <SelectRole label='NightWing Role' />
                                <Space h={space} />
                                <SelectRole label='RainWing Role' />
                                <Space h={space} />
                                <SelectRole label='SandWing Role' />
                                <Space h={space} />
                                <SelectRole label='SeaWing Role' />
                                <Space h={space} />
                                <SelectRole label='SilkWing Role' />
                                <Space h={space} />
                                <SelectRole label='SkyWing Role' />
                                <Space h={space} />
                            </Fieldset>
                            <Space h={space} />
                            <Fieldset legend="Infractions">
                                <NumberInput label='Infraction Expire Time' placeholder='90' description='The amount of time in days (as an integer) that infractions take to expire. Expired infractions are not deleted, but they do not count toward a total infraction count.' />
                                <Space h={space} />
                                <SelectCategory label='Infractions Category' description='The ID of the category to create infractions channels. They will accumulate here.' />
                            </Fieldset>
                            <Space h={space} />
                            <Fieldset legend="Economy">
                                <TextInput label='Shop Name' placeholder='Shop' description='The name of the Discord shop. This will appear at the top of the embed.' />
                                <Space h={space} />
                                <TextInput label='Currency Icon' placeholder='$' description='The icon used for currency in the Discord economy system. This can be any string, including symbols, letters, emojis, and Discord custom emoji.' />
                                <Space h={space} />
                                <NumberInput label='Daily Base Amount' placeholder='10.00' description='The base amount given by the /daily Discord command. This is the default amount before adding the streak bonus. The total amount is decided by dailyBaseAmount + (user streak * this).' />
                                <Space h={space} />
                                <NumberInput label='Daily Streak Multiplier' placeholder='5.00' description='The multiplier of the streak bonus given by the /daily command. This is multiplied by the streak and added to the base amount. The total amount is decided by dailyBaseAmount + (users streak * this).' />
                                <Space h={space} />
                                <NumberInput label='Work Reward' placeholder='20.00' description='The amount gained from the /work command. /work can only be run every hour.' />
                            </Fieldset>
                            <Space h={space} />
                            <Fieldset legend="Mail">
                                <NumberInput label='Mail Delivery Location Selection Distance Weight Multiplier' placeholder='1.00' description='The multiplier of the distance weight when choosing mail delivery locations. Takes the ratio (between 0 and 1) of the distance to the maximum distance between locations, multiplies it by this value, and adds it to the mail location weight. This weight is used to randomly choose a mail location to deliver to provide a realistic relationship between delivery locations. At 0, distance has no effect on location selection. At 1, the weight will have a slight effect on the location selection. At 10, the weight will have a significant effect on the location selection. The weight is applied inversely, making closer distances worth more than further distances.' />
                                <Space h={space} />
                                <NumberInput label='Mail Distance To Reward Multiplier' placeholder='0.05' description='Mail delivery reward is calculated by multiplying the distance by this number. The result is then rounded to the nearest ten. At 0, the reward given is 0. At 1, the reward given will be the distance in blocks.' />
                            </Fieldset>
                            <Space h={space} />
                            <Fieldset legend="Permission Group Collections">
                                <Group grow>
                                    <ActionIcon w={"min-content"} variant="subtle" color='red' aria-label="Remove" size={'xl'}>
                                        <IconTrash />
                                    </ActionIcon>
                                    <TextInput label='Name'></TextInput>
                                    <SelectGroup label='Groups' />

                                </Group>
                                <Space h={space} />
                                <Button>Add</Button> {/* TODO: make button add group */}
                            </Fieldset>
                            <Space h={space} />
                            <Divider />
                            <Space h={space} />
                            <Group>
                                <Button>Apply</Button>
                                <Button variant='light'>Revert</Button>
                            </Group>
                        </Tabs.Panel>

                        <Tabs.Panel value="economy">
                            <Space h={space} />
                            <Title order={2}>Economy Configuration</Title>
                            <Text size="md">Configure the Discord economy system.</Text>
                            <Space h={space} />
                            <Divider />
                            <Space h={space} />

                            <Group>
                                {items.map((item, index) => (
                                    <Transition
                                        mounted={items[index] === (item)}
                                        transition="fade"
                                        duration={400}
                                        timingFunction="ease"
                                    >
                                        {(styles) => <div style={styles}>
                                            <Card shadow="sm" padding="lg" radius="md" withBorder key={item.id} style={{ marginBottom: '1rem' }}>
                                                <TextInput
                                                    label="Name"
                                                    value={item.name}
                                                    onChange={(event) => handleInputChange(index, 'name', event.target.value)}
                                                    required
                                                />

                                                <Space h="md" />

                                                <Textarea
                                                    label="Description"
                                                    value={item.description}
                                                    onChange={(event) => handleInputChange(index, 'description', event.target.value)}
                                                />

                                                <Space h="md" />

                                                <NumberInput
                                                    label="Price"
                                                    value={item.price}
                                                    onChange={(value) => handleInputChange(index, 'price', value)}
                                                    min={0}
                                                    decimalScale={2}
                                                    required
                                                />

                                                <Space h="md" />

                                                <NumberInput
                                                    label="Sale Percent"
                                                    value={item.salePercent}
                                                    placeholder="Infinite"
                                                    onChange={(value) => handleInputChange(index, 'salePercent', value)}
                                                    min={0}
                                                    max={100}
                                                    step={0.1}
                                                />

                                                <Space h="md" />

                                                <Switch
                                                    label="Enabled"
                                                    checked={item.enabled}
                                                    onChange={(event) => handleInputChange(index, 'enabled', event.currentTarget.checked)}
                                                />

                                                <Space h="md" />

                                                <Switch
                                                    label="Gifting Enabled"
                                                    checked={item.giftingEnabled}
                                                    onChange={(event) => handleInputChange(index, 'giftingEnabled', event.currentTarget.checked)}
                                                />

                                                <Space h="md" />

                                                <Switch
                                                    label="Use On Purchase"
                                                    checked={item.useOnPurchase}
                                                    onChange={(event) => handleInputChange(index, 'useOnPurchase', event.currentTarget.checked)}
                                                />

                                                <Space h="md" />

                                                <NumberInput
                                                    label="Quantity"
                                                    value={item.quantity === -1 ? "" : item.quantity}
                                                    placeholder="Infinite"
                                                    onChange={(value) => handleInputChange(index, 'quantity', value)}
                                                    min={-1}
                                                />

                                                <Space h="md" />

                                                <NumberInput
                                                    label="Max Allowed"
                                                    value={item.maxAllowed === -1 ? "" : item.maxAllowed}
                                                    placeholder="Infinite"
                                                    onChange={(value) => handleInputChange(index, 'maxAllowed', value)}
                                                    min={-1}
                                                />

                                                <Space h="md" />

                                                <Switch
                                                    label="Use Disabled"
                                                    checked={item.useDisabled}
                                                    onChange={(event) => handleInputChange(index, 'useDisabled', event.currentTarget.checked)}
                                                />

                                                <Space h="md" />

                                                <Group justify='space-between'>
                                                    <Button onClick={() => console.log('Item updated:', items[index])}>Save</Button>
                                                    <ActionIcon color='red' variant='subtle' onClick={() => deleteItem(item.id)} ><IconTrash /></ActionIcon>
                                                </Group>
                                            </Card>
                                        </div>}
                                    </Transition>
                                ))}
                            </Group>
                            <Space h={space} />
                            <Button onClick={addItem}>Add New Item</Button>
                        </Tabs.Panel>

                    </Tabs>
                </div>
            </div>
        </>
    );
}
