import { DiscordUserTable } from '@/components/DiscordUserTable/DiscordUserTable';
import { CloseButton, Space, TextInput, Transition } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

interface UserTableProps {
  opened: boolean;
  setOpened: (value: boolean) => void;
}

export function UserTable({ opened, setOpened }: UserTableProps) {
  const [value, setValue] = useState('');

  return (
    <div style={{ gridColumn: 1, gridRow: 1 }}>
      <Transition
        mounted={opened}
        transition="fade-up"
        duration={400}
        timingFunction="ease"
        enterDelay={250}
      >
        {(styles) => (
          <div style={styles}>
            <Space h="md" />
            <TextInput
              leftSectionPointerEvents="none"
              leftSection={<IconSearch />}
              placeholder="Search by username"
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => setValue('')}
                  style={{ display: value ? undefined : 'none' }}
                />
              }
            />
            <DiscordUserTable setOpened={setOpened} />
          </div>
        )}
      </Transition>
    </div>
  );
}
