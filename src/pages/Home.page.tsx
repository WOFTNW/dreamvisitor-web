import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { Text } from '@mantine/core';

export function HomePage() {
  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <NavbarSimple page="Home" />
        <div style={{margin:'var(--mantine-spacing-xl)'}}>
          <Text>This page hasn't been designed yet.</Text>
        </div>
      </div>
    </>
  );
}
