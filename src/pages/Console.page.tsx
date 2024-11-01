import { InteractiveConsole } from '@/components/InteractiveConsole/InteractiveConsole';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';

export function ConsolePage() {
    return (
        <>
            <div style={{ display: 'flex ', flexDirection: 'row'}}>
                <NavbarSimple page="Console" />
                <div style={{margin:'var(--mantine-spacing-xl)', flexShrink:1 }}>
                    <InteractiveConsole />
                </div>

            </div>
        </>
    );
}
