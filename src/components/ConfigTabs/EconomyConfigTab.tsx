import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Divider,
  Group,
  NumberInput,
  SimpleGrid,
  Space,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { IconChevronDown, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

interface EconomyItem { /* ... same as before ... */ }
interface EconomyConfigTabProps { space: string }

interface EconomyItem {
  useDisabled: boolean;
  onUseGroupsAdd: any[];
  maxAllowed: number;
  quantity: number;
  onUseConsoleCommands: any[];
  giftingEnabled: boolean;
  description: string;
  enabled: boolean;
  onUseRolesRemove: any[];
  price: number;
  name: string;
  salePercent: number;
  useOnPurchase: boolean;
  onUseRolesAdd: any[];
  id: number;
  onUseGroupsRemove: any[];
}

interface EconomyConfigTabProps {
  space: string;
}

const ecoItems: EconomyItem[] = [
  {
    useDisabled: false,
    onUseGroupsAdd: [],
    maxAllowed: -1,
    quantity: -1,
    onUseConsoleCommands: [],
    giftingEnabled: true,
    description: "Get exclusive content!",
    enabled: true,
    onUseRolesRemove: [],
    price: 10000.0,
    name: "Insider Perks Tier 1",
    salePercent: 0.0,
    useOnPurchase: false,
    onUseRolesAdd: [],
    id: 31464872,
    onUseGroupsRemove: [],
  },
  {
    useDisabled: true,
    onUseGroupsAdd: [],
    maxAllowed: 5,
    quantity: 10,
    onUseConsoleCommands: [],
    giftingEnabled: false,
    description: "Another exclusive content tier!",
    enabled: false,
    onUseRolesRemove: [],
    price: 20000.0,
    name: "Insider Perks Tier 2",
    salePercent: 10.0,
    useOnPurchase: true,
    onUseRolesAdd: [],
    id: 31464873,
    onUseGroupsRemove: [],
  }
];

// Template for a new item
const newItemTemplate: EconomyItem = {
  useDisabled: false,
  onUseGroupsAdd: [],
  maxAllowed: -1,
  quantity: -1,
  onUseConsoleCommands: [],
  giftingEnabled: true,
  description: "A new shiny item!",
  enabled: true,
  onUseRolesRemove: [],
  price: 0.0,
  name: "New Item",
  salePercent: 0.0,
  useOnPurchase: false,
  onUseRolesAdd: [],
  id: Date.now(),  // Generate a unique ID using the current timestamp
  onUseGroupsRemove: [],
};

export function EconomyConfigTab({ space }: EconomyConfigTabProps) {
  const theme = useMantineTheme();
  const [items, setItems] = useState<EconomyItem[]>(ecoItems);
  const [openStates, setOpenStates] = useState<Record<number, boolean>>(() => {
    // Initialize all items as open by default
    return items.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
  });

  const toggleCollapse = (id: number) => {
    setOpenStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setItems(updatedItems);
  };

  const addItem = () => {
    const newItem = { ...newItemTemplate, id: Date.now() };
    setItems((prev) => [...prev, newItem]);
    // Set the open state for the new item
    setOpenStates((prev) => ({ ...prev, [newItem.id]: true }));
  };
  const deleteItem = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <>
      <Space h={space} />
      <Group justify="space-between" align="center">
        <Title order={2}>Economy Configuration</Title>
        <Button onClick={addItem}>+ Add Item</Button>
      </Group>
      <Text color="dimmed" size="sm">Configure your Discord economy items below.</Text>
      <Space h={space} />
      <Divider />
      <Space h={space} />

      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        {items.map((item, index) => (
          <Transition key={item.id} mounted transition="fade" duration={300} timingFunction="ease">
            {(styles) => (
              <div style={styles}>
                <Card
                  shadow="sm"
                  p="md"
                  radius="md"
                  withBorder
                  styles={{
                    root: {
                      transition: 'transform 0.2s ease',
                      '&:hover': { transform: 'scale(1.02)', boxShadow: theme.shadows.md },
                    }
                  }}
                >
                  <Group justify="space-between" align="center" mb="sm">
                    <Text fw={600} size="lg">{item.name}</Text>
                    <Group gap="xs">
                      {item.salePercent > 0 && (
                        <Badge color="teal" variant="light">
                          -{item.salePercent}%
                        </Badge>
                      )}
                      <ActionIcon color="red" variant="light" onClick={() => deleteItem(item.id)}>
                        <IconTrash size={18} />
                      </ActionIcon>
                      <ActionIcon onClick={() => toggleCollapse(item.id)}>
                        <IconChevronDown
                          size={18}
                          style={{
                            transform: openStates[item.id] ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s'
                          }}
                        />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Collapse in={openStates[item.id]}>
                    <TextInput
                      label="Name"
                      value={item.name}
                      onChange={(e) => handleInputChange(index, 'name', e.currentTarget.value)}
                      required
                    />
                    <Space h="sm" />

                    <Textarea
                      label="Description"
                      value={item.description}
                      onChange={(e) => handleInputChange(index, 'description', e.currentTarget.value)}
                      autosize
                      minRows={2}
                    />
                    <Space h="sm" />

                    <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
                      <NumberInput
                        label="Price"
                        value={item.price}
                        onChange={(val) => handleInputChange(index, 'price', val)}
                        min={0}
                        required
                      />

                      <NumberInput
                        label="Sale %"
                        value={item.salePercent}
                        onChange={(val) => handleInputChange(index, 'salePercent', val)}
                        min={0}
                        max={100}
                        step={0.1}
                        hideControls
                      />
                    </SimpleGrid>
                    <Space h="sm" />

                    <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
                      <NumberInput
                        label="Quantity"
                        value={item.quantity === -1 ? undefined : item.quantity}
                        placeholder="Infinite"
                        onChange={(val) => handleInputChange(index, 'quantity', val)}
                        min={-1}
                      />

                      <NumberInput
                        label="Max Allowed"
                        value={item.maxAllowed === -1 ? undefined : item.maxAllowed}
                        placeholder="Infinite"
                        onChange={(val) => handleInputChange(index, 'maxAllowed', val)}
                        min={-1}
                      />
                    </SimpleGrid>
                    <Space h="sm" />

                    <Group gap="xs" grow>
                      <Switch
                        label="Enabled"
                        checked={item.enabled}
                        onChange={(e) => handleInputChange(index, 'enabled', e.currentTarget.checked)}
                      />
                      <Switch
                        label="Gifting"
                        checked={item.giftingEnabled}
                        onChange={(e) => handleInputChange(index, 'giftingEnabled', e.currentTarget.checked)}
                      />
                    </Group>
                    <Space h="xs" />
                    <Switch
                      label="Use On Purchase"
                      checked={item.useOnPurchase}
                      onChange={(e) => handleInputChange(index, 'useOnPurchase', e.currentTarget.checked)}
                    />
                    <Space h="md" />

                    <Group justify="flex-end">
                      <Button>Save</Button>
                    </Group>
                  </Collapse>
                </Card>
              </div>
            )}
          </Transition>
        ))}
      </SimpleGrid>
    </>
  );
}
