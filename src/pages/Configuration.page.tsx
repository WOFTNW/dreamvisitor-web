import { LocationInput } from '@/components/LocationInput/LocationInput';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { SelectCategory } from '@/components/SelectGroupsSearchable/SelectCategory';
import { SelectChannel } from '@/components/SelectGroupsSearchable/SelectChannel';
import { SelectRole } from '@/components/SelectGroupsSearchable/SelectRole';
import { Alert, Button, Checkbox, Divider, Fieldset, NumberInput, PasswordInput, Space, Tabs, Text, TextInput, Title } from '@mantine/core';
import { IconSettings, IconServer, IconTool, IconInfoCircle } from '@tabler/icons-react';

export function ConfigPage() {
    const space = "md";

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <NavbarSimple page={"Configuration"} />
                <div style={{ margin: 'var(--mantine-spacing-md)' }}>
                    <Title order={1}>Configuration</Title>
                    <Text>Change settings of Dreamvisitor and the server.</Text>
                    <Space h={space} />
                    <Divider />
                    <Space h={space} />
                    <Tabs defaultValue="server">
                        <Tabs.List>
                            <Tabs.Tab value="server" leftSection={<IconServer />}>
                                Server
                            </Tabs.Tab>
                            <Tabs.Tab value="dreamvisitor" leftSection={<IconTool />}>
                                Dreamvisitor
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="server">
                        <Space h={space}></Space>
                            <Title order={2}>Server Configuration</Title>
                            <Text size="md">Configure the PaperMC server.</Text>
                            <Space h={space}></Space>
                            <Button>Apply</Button>
                        </Tabs.Panel>

                        <Tabs.Panel value="dreamvisitor">
                        <Space h={space}></Space>
                            <Title order={2}>Dreamvisitor Configuration</Title>
                            <Text size="md">Configure Dreamvisitor.</Text>
                            <Space h={space}></Space>
                            <Divider></Divider>
                            <Space h={space}></Space>
                            <Checkbox label='Debug Mode' description='Whether to enable debug messages. This will send additional messages to help debug Dreamvisitor. Disabled by default.'></Checkbox>
                            <Space h={space}></Space>
                            <PasswordInput label='Bot Token' description='The Dreamvisitor bot token. DO NOT SHARE THIS. Dreamvisitor will not work properly unless this is a valid bot token. Ask Bog for a bot token if Dreamvisitor reports a login error on startup.'></PasswordInput>
                            <Space h={space}></Space>
                            <Alert variant="light" color="blue" radius="md" title="Sensitive information" icon=<IconInfoCircle />>
                                The Dreamvisitor bot token allows programs to control the Dreamvisitor bot. A malicious program with the token would be granted all permissions that Dreamvisitor bot has. Only DreamvisitorHub should be allowed to operate Dreamvisitor bot. Do not reveal or change this value unless the bot token is invalid.
                            </Alert>
                            <Space h={space}></Space>
                            <TextInput label='Website URL' placeholder='https://woftnw.org' description='The URL for the whitelisting website. Used to restrict requests not from the specified website to prevent abuse.'></TextInput>
                            <Space h={space}></Space>
                            <Checkbox label='Web Whitelist' description='Whether web whitelisting is enabled or not. This can be set with the /toggleweb Discord command. Enabled by default.'></Checkbox>
                            <Space h={space}></Space>
                            <SelectChannel label='Game Chat Channel' description='The channel of the game chat. This can be set on Discord with /setgamechat.'></SelectChannel>
                            <Space h={space}></Space>
                            <SelectChannel label='Log Channel' description='The channel of the log chat. This can be set on Discord with /setlogchat.'></SelectChannel>
                            <Space h={space}></Space>
                            <SelectChannel label='Whitelist Channel' description='The channel of the whitelist chat. This can be set on Discord with /setwhitelist.'></SelectChannel>
                            <Space h={space}></Space>
                            <Fieldset legend="Tribe Roles">
                                <SelectRole label='HiveWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='IceWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='LeafWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='MudWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='NightWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='RainWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='SandWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='SeaWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='SilkWing Role'></SelectRole>
                                <Space h={space}></Space>
                                <SelectRole label='SkyWing Role'></SelectRole>
                                <Space h={space}></Space>
                            </Fieldset>
                            <Space h={space}></Space>
                            <Checkbox label='Chat Pause' description='Whether chat is paused or not. This can be toggled in Minecraft with /pausechat. Disabled by default.'></Checkbox>
                            <Space h={space}></Space>
                            <Checkbox label='Softwhitelist' description='Whether the soft whitelist is enabled or not. This can be set in Minecraft with /softwhitelist [on|off]. Disabled by default.'></Checkbox>
                            <Space h={space}></Space>
                            <NumberInput label='Player Limit Override' description='Player limit override. This will override the player limit, both over and under. This can be set in Minecraft with /playerlimit <int>'></NumberInput>
                            <Space h={space}></Space>
                            <Checkbox label='Disable PvP' description='Whether to globally disable pvp or not. This can be toggled in Minecraft with /togglepvp.'></Checkbox>
                            <Space h={space}></Space>
                            <LocationInput label='Hub Location' />
                            <Space h={space}></Space>
                            <Checkbox label='Log Console' description='Whether to copy the output of the console to the Discord log channel. This will disable the default Dreamvisitor logging in place of the Minecraft server console.'></Checkbox>
                            <Space h={space}></Space>
                            <Checkbox label='Enable Log Console Commands' description='Whether to pass messages in the log channel as console commands. If log-console is enabled, this will take messages sent by users with the Discord administrator permission and pass them as console commands.'></Checkbox>
                            <Space h={space}></Space>
                            <NumberInput label='Infraction Expire Time' placeholder='90' description='The amount of time in days (as an integer) that infractions take to expire. Expired infractions are not deleted, but they do not count toward a total infraction count.'></NumberInput>
                            <Space h={space}></Space>
                            <SelectCategory label='Infractions Category' description='The ID of the category to create infractions channels. They will accumulate here.' />
                            <Space h={space}></Space>
                            <TextInput label='Shop Name' placeholder='Shop' description='The name of the Discord shop. This will appear at the top of the embed.'/ >
                            <Space h={space}></Space>
                            <TextInput label='Currency Icon' placeholder='$' description='The icon used for currency in the Discord economy system. This can be any string, including symbols, letters, emojis, and Discord custom emoji.'/ >
                            <Space h={space}></Space>
                            <NumberInput label='Daily Base Amount' placeholder='10.00' description='The base amount given by the /daily Discord command. This is the default amount before adding the streak bonus. The total amount is decided by dailyBaseAmount + (user streak * this).' />
                            <Space h={space}></Space>
                            <NumberInput label='Daily Streak Multiplier' placeholder='5.00' description='The multiplier of the streak bonus given by the /daily command. This is multiplied by the streak and added to the base amount. The total amount is decided by dailyBaseAmount + (users streak * this).' />
                            <Space h={space}></Space>
                            <NumberInput label='Work Reward' placeholder='20.00' description='The amount gained from the /work command. /work can only be run every hour.' />
                            <Space h={space}></Space>
                            <NumberInput label='Mail Delivery Location Selection Distance Weight Multiplier' placeholder='1.00' description='The multiplier of the distance weight when choosing mail delivery locations. Takes the ratio (between 0 and 1) of the distance to the maximum distance between locations, multiplies it by this value, and adds it to the mail location weight. This weight is used to randomly choose a mail location to deliver to provide a realistic relationship between delivery locations. At 0, distance has no effect on location selection. At 1, the weight will have a slight effect on the location selection. At 10, the weight will have a significant effect on the location selection. The weight is applied inversely, making closer distances worth more than further distances.' />
                            <Space h={space}></Space>
                            <NumberInput label='Mail Distance To Reward Multiplier' placeholder='0.05' description='Mail delivery reward is calculated by multiplying the distance by this number. The result is then rounded to the nearest ten. At 0, the reward given is 0. At 1, the reward given will be the distance in blocks.' />
                            <Space h={space}></Space>
                            <TextInput label='Resource Pack Repository' placeholder='WOFTNW/Dragonspeak' description='The repository path of the server resource pack. Dreamvisitor will pull the first artifact from the latest release on pack update.'/ >
                            <Space h={space}></Space>
                            <Divider></Divider>
                            <Space h={space}></Space>
                            <Button>Apply</Button>
                        </Tabs.Panel>

                    </Tabs>
                </div>
            </div>
        </>
    );
}
