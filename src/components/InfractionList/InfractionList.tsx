import { Accordion, Badge, Group, Text } from '@mantine/core';
import { Infraction } from '@/types/models';

interface InfractionListProps {
  infractions: Infraction[];
}

export function InfractionList({ infractions }: InfractionListProps) {
  function getBadge(expired: boolean) {
    return expired ?
      <Badge variant='light' color="gray">Expired</Badge> :
      <Badge variant='light' color="red">Active</Badge>;
  }

  // Use real infractions data
  const items = infractions.map((item) => (
    <Accordion.Item key={item.id} value={item.id}>
      <Accordion.Control>
        <Group justify="space-between">
          <Group>
            <Text fw={700}>Points: {item.value}</Text>
            <Text size="sm" c="dimmed">
              {new Date(item.created).toLocaleDateString()}
            </Text>
          </Group>
          {getBadge(item.expired)}
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Text>{item.reason || "No reason provided"}</Text>
        {item.warn_channel_id && (
          <Text size="sm" mt="xs">Warning issued in channel: {item.warn_channel_id}</Text>
        )}
        <Text size="xs" c="dimmed" mt="xs">
          Created: {new Date(item.created).toLocaleString()}
        </Text>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion variant="contained">
      {items.length > 0 ? items : <Text p="md">No infractions found</Text>}
    </Accordion>
  );
}
