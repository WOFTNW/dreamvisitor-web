import { Accordion, Badge, Group, Space, Text, ActionIcon } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { Infraction } from '@/types/models';

interface InfractionListProps {
  infractions: Infraction[];
  onEdit?: (infraction: Infraction) => void;
}

export function InfractionList({ infractions, onEdit }: InfractionListProps) {
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
          <Group>
            {getBadge(item.expired)}
            {onEdit && (
              <ActionIcon
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion from toggling
                  onEdit(item);
                }}
                aria-label="Edit infraction"
              >
                <IconEdit size={16} />
              </ActionIcon>
            )}
            <Space w='s'></Space>
          </Group>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Text>{item.reason || "No reason provided"}</Text>
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
