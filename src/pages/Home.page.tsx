import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { Text, Title } from '@mantine/core';

export function HomePage() {
  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <NavbarSimple page={"Home"} />
        <div style={{margin:'var(--mantine-spacing-md)'}}>
          <Title order={1}>Header</Title>
          <Text>Home page</Text>
        </div>
      </div>
    </>
  );
}
