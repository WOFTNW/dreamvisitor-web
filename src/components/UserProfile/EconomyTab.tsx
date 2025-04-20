import { User, UserInventoryItem } from '@/types/models';
import { Badge, Group, Paper, Space, Text, Title } from '@mantine/core';
import { IconCoin } from '@tabler/icons-react';

interface EconomyTabProps {
  userData: User;
  inventory: UserInventoryItem[];
}

export function EconomyTab({ userData, inventory }: EconomyTabProps) {
  return (
    <>
      <Space h="md" />
      <Paper p="md" withBorder mb="md">
        <Title order={4} mb="md">Economy Overview</Title>
        <Group align="center" gap="xs" mb="sm">
          <IconCoin size={20} />
          <Text fw={700}>Balance: {userData.balance}</Text>
        </Group>
        <Text><strong>Daily Streak:</strong> {userData.daily_streak}</Text>
        <Text><strong>Last Daily Claim:</strong> {new Date(userData.last_daily).toLocaleString()}</Text>
        <Text><strong>Last Work:</strong> {new Date(userData.last_work).toLocaleString()}</Text>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={4} mb="md">Inventory ({inventory.length} items)</Title>
        {inventory.length > 0 ? (
          inventory.map(invItem => {
            const item = invItem.expand?.item;
            return (
              <Paper key={invItem.id} p="sm" withBorder mb="sm">
                <Group justify="space-around">
                  <Text fw={700}>{item?.name || "Unknown Item"}</Text>
                  <Badge>Qty: {invItem.quantity}</Badge>
                </Group>
                <Text size="sm">{item?.description || "No description"}</Text>
                <Group mt="xs">
                  <Text size="xs" c="dimmed">Value: {item?.price || 0}</Text>
                  {item?.sale_percent ? (
                    <Badge color="green">Sale: {item.sale_percent}% off</Badge>
                  ) : null}
                </Group>
              </Paper>
            );
          })
        ) : (
          <Text>No items in inventory</Text>
        )}
      </Paper>
    </>
  );
}
