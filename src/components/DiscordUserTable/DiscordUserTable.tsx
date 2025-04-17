import { User } from '@/types/models';
import { Avatar, Badge, Table, Text } from '@mantine/core';
import classes from './DiscordUserTable.module.css';


interface DiscordUserTableProps {
  setOpened: (value: boolean) => void;
  users: User[];
  onUserSelect: (userId: string) => void;
}

export function DiscordUserTable({ setOpened, users, onUserSelect }: DiscordUserTableProps) {

  const rows = users.map((user) => (
    <Table.Tr
      key={user.id}
      className={classes.row}
      onClick={() => {
        onUserSelect(user.id);
        setOpened(false);
      }}
    >
      <Table.Td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar size="md" radius="xl" />
          <Text>{user.discord_id}</Text>
        </div>
      </Table.Td>
      <Table.Td>{user.mc_username}</Table.Td>
      <Table.Td>
        <Badge
          color={user.is_banned ? "red" : user.is_suspended ? "orange" : "green"}
        >
          {user.is_banned ? "Banned" : user.is_suspended ? "Suspended" : "Active"}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={500} py="md">
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr className={classes.top}>
            <Table.Th>User</Table.Th>
            <Table.Th>Minecraft</Table.Th>
            <Table.Th>Standing</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
