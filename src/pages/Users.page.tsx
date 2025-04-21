import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { UserProfile } from '@/components/UserProfile/UserProfile';
import { UserTable } from '@/components/UserTable/UserTable';
import { useState, useCallback, useEffect } from 'react';

export function UsersPage() {
  const [listOpen, setOpened] = useState(true); // Start with the user list open
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // No user selected initially

  // Use callback to prevent unnecessary re-renders
  const handleUserSelect = useCallback((userId: string) => {
    console.log("handle user select");
    setSelectedUserId(userId);
    console.log(userId);
    
    setOpened(false); // Close the table and show the profile
  }, []);

  // Use callback for toggling between views
  const toggleView = useCallback((isTableVisible: boolean, userId?: string) => {
    console.log("toggle view");
    setOpened(isTableVisible);
    console.log(userId);
    
    if (isTableVisible) {
      window.history.replaceState(null, "", "/users");
    } else {
      window.history.replaceState(null, "", "/users/" + userId);
    }
  }, []);
  
  // Automatically open user if defined in URL
  useEffect(() => {
    console.log("use effect");
    
    console.log(location.pathname);
    let id: string = location.pathname.split("/users/")[1];
    console.log(id);
    
    if (id) {
      handleUserSelect(id);
    }
  }, []);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <NavbarSimple page="Users" />
        <div style={{ margin: 'var(--mantine-spacing-xl)', width: '100%' }}>
          <div style={{ display: 'grid' }}>
            <UserProfile
              opened={!listOpen}
              userId={selectedUserId}
              setOpened={toggleView}

            />
            <UserTable
              opened={listOpen}
              setSelectedUserId={handleUserSelect}
              setOpened={toggleView}
            />
          </div>
        </div>
      </div>
    </>
  );
}
