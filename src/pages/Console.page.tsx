import { InteractiveConsole } from '@/components/InteractiveConsole/InteractiveConsole';
import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';

export function ConsolePage() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
        <NavbarSimple page="Console" />
        <div style={{
          margin: 'var(--mantine-spacing-xl)',
          flexGrow: 1,
          flexShrink: 1,
          display: 'flex',
          overflow: 'hidden',
          width: 'calc(100% - 300px - var(--mantine-spacing-xl) * 2)'
        }}>
          <InteractiveConsole />
        </div>
      </div>
    </>
  );
}
