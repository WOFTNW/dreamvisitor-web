import { ActionIcon, Button, Card, Divider, Group, NumberInput, Space, Switch, Text, Textarea, TextInput, Title, Transition } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

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
  const [items, setItems] = useState(ecoItems);

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems((prevItems) => [...prevItems, { ...newItemTemplate, id: Date.now() }]);
  };

  const deleteItem = (id: number) => {
    setItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  return (
    <>
      <Space h={space} />
      <Title order={2}>Economy Configuration</Title>
      <Text size="md">Configure the Discord economy system.</Text>
      <Space h={space} />
      <Divider />
      <Space h={space} />

      <Group>
        {items.map((item, index) => (
          <Transition
            key={item.id}
            mounted={items[index] === (item)}
            transition="fade"
            duration={400}
            timingFunction="ease"
          >
            {(styles) => <div style={styles}>
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ marginBottom: '1rem' }}>
                <TextInput
                  label="Name"
                  value={item.name}
                  onChange={(event) => handleInputChange(index, 'name', event.target.value)}
                  required
                />

                <Space h="md" />

                <Textarea
                  label="Description"
                  value={item.description}
                  onChange={(event) => handleInputChange(index, 'description', event.target.value)}
                />

                <Space h="md" />

                <NumberInput
                  label="Price"
                  value={item.price}
                  onChange={(value) => handleInputChange(index, 'price', value)}
                  min={0}
                  decimalScale={2}
                  required
                />

                <Space h="md" />

                <NumberInput
                  label="Sale Percent"
                  value={item.salePercent}
                  placeholder="Infinite"
                  onChange={(value) => handleInputChange(index, 'salePercent', value)}
                  min={0}
                  max={100}
                  step={0.1}
                />

                <Space h="md" />

                <Switch
                  label="Enabled"
                  checked={item.enabled}
                  onChange={(event) => handleInputChange(index, 'enabled', event.currentTarget.checked)}
                />

                <Space h="md" />

                <Switch
                  label="Gifting Enabled"
                  checked={item.giftingEnabled}
                  onChange={(event) => handleInputChange(index, 'giftingEnabled', event.currentTarget.checked)}
                />

                <Space h="md" />

                <Switch
                  label="Use On Purchase"
                  checked={item.useOnPurchase}
                  onChange={(event) => handleInputChange(index, 'useOnPurchase', event.currentTarget.checked)}
                />

                <Space h="md" />

                <NumberInput
                  label="Quantity"
                  value={item.quantity === -1 ? "" : item.quantity}
                  placeholder="Infinite"
                  onChange={(value) => handleInputChange(index, 'quantity', value)}
                  min={-1}
                />

                <Space h="md" />

                <NumberInput
                  label="Max Allowed"
                  value={item.maxAllowed === -1 ? "" : item.maxAllowed}
                  placeholder="Infinite"
                  onChange={(value) => handleInputChange(index, 'maxAllowed', value)}
                  min={-1}
                />

                <Space h="md" />

                <Switch
                  label="Use Disabled"
                  checked={item.useDisabled}
                  onChange={(event) => handleInputChange(index, 'useDisabled', event.currentTarget.checked)}
                />

                <Space h="md" />

                <Group justify='space-between'>
                  <Button onClick={() => console.log('Item updated:', items[index])}>Save</Button>
                  <ActionIcon color='red' variant='subtle' onClick={() => deleteItem(item.id)} ><IconTrash /></ActionIcon>
                </Group>
              </Card>
            </div>}
          </Transition>
        ))}
      </Group>
      <Space h={space} />
      <Button onClick={addItem}>Add New Item</Button>
    </>
  );
}
