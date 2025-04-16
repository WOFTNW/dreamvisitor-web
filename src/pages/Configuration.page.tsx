import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { ServerConfigTab } from '@/components/ConfigTabs/ServerConfigTab';
import { DreamvisitorConfigTab } from '@/components/ConfigTabs/DreamvisitorConfigTab';
import { EconomyConfigTab } from '@/components/ConfigTabs/EconomyConfigTab';
import { Tabs } from '@mantine/core';
import { IconServer, IconTool, IconMoneybag } from '@tabler/icons-react';

export function ConfigPage() {
  const space = "md";

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
              {/* <Tabs.Tab value="economy" leftSection={<IconMoneybag />}>
                Economy
              </Tabs.Tab> */}
            </Tabs.List>

            <Tabs.Panel value="server">
              <ServerConfigTab space={space} />
            </Tabs.Panel>

            <Tabs.Panel value="dreamvisitor">
              <DreamvisitorConfigTab space={space} />
            </Tabs.Panel>

            <Tabs.Panel value="economy">
              <EconomyConfigTab space={space} />
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>
    </>
  );
}
