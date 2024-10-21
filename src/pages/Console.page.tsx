import { InteractiveConsole } from '@/components/InteractiveConsole/InteractiveConsole';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { Space, Text, Title } from '@mantine/core';

export function ConsolePage() {
    return (
        <>
            <div style={{ display: 'flex ', flexDirection: 'row'}}>
                <NavbarSimple page={'Console'} />
                <div style={{margin:'var(--mantine-spacing-md)', width: '800px'}}>
                    <Title>Console</Title>
                    <Text>View logs and execute console commands.</Text>
                    <Space h={'md'} />
                    <div style={{ width:'100%', display: 'flex', marginRight: 'var(--mantine-spacing-md)', flexShrink: 1 }}>
                        <InteractiveConsole />
                    </div>
                </div>

            </div>
        </>
    );
}
