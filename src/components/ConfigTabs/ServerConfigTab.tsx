import { Button, Space, Text, Title } from '@mantine/core';

interface ServerConfigTabProps {
  space: string;
}

export function ServerConfigTab({ space }: ServerConfigTabProps) {
  return (
    <>
      <Space h={space} />
      <Title order={2}>Server Configuration</Title>
      <Text size="md">Configure the PaperMC server.</Text>
      <Space h={space} />
      <Button>Apply</Button>
    </>
  );
}
