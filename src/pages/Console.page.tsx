import { InteractiveConsole } from '@/components/InteractiveConsole/InteractiveConsole';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';

export function ConsolePage() {
    return (
        <>
            <div style={{ display: 'flex ', flexDirection: 'row'}}>
                <NavbarSimple page="Console" />
                <div style={{margin:'var(--mantine-spacing-xl)', width: '800px'}}>
                    <div style={{ width:'100%', display: 'flex', marginRight: 'var(--mantine-spacing-md)', flexShrink: 1 }}>
                        <InteractiveConsole />
                    </div>
                </div>

            </div>
        </>
    );
}
