import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserTable } from '@/components/UserTable/UserTable';
import { useState, useCallback } from 'react';

export function UsersPage() {
  const [opened, setOpened] = useState(true); // Start with the user list open
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // No user selected initially

  // Use callback to prevent unnecessary re-renders
  const handleUserSelect = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setOpened(false); // Close the table and show the profile
  }, []);

  // Use callback for toggling between views
  const toggleView = useCallback((isTableVisible: boolean) => {
    setOpened(isTableVisible);
  }, []);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <NavbarSimple page="Users" />
        <div style={{ margin: 'var(--mantine-spacing-xl)', width: '100%' }}>
          <div style={{ display: 'grid' }}>
            <UserProfile
              opened={!opened}
              setOpened={toggleView}
              userId={selectedUserId}
            />
            <UserTable
              opened={opened}
              setOpened={toggleView}
              setSelectedUserId={handleUserSelect}
            />
          </div>
        </div>
      </div>
    </>
  );
}
