import React, { memo } from 'react';
import { Fieldset, TextInput, NumberInput, Space } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

interface FlightFieldsetProps {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  space: string;
}

function FlightFieldset({ config, setConfig, space }: FlightFieldsetProps) {
  // Debounce input changes to reduce re-renders
  const handleNumberChange = useDebouncedCallback((field: string, value: string | number | null) => {
    setConfig((prev: any) => ({ ...prev, [field]: Number(value) }));
  }, 300);

  const handleTextChange = useDebouncedCallback((field: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  }, 300);

  return (
    <Fieldset legend="Flight">
      <NumberInput
        label='Flight Energy Capacity'
        placeholder='400'
        description='The maximum amount of flight energy.'
        value={config.flightEnergyCapacity}
        onChange={(val) => handleNumberChange('flightEnergyCapacity', val)}
        decimalScale={0}
        step={1}
      />
      <Space h={space} />
      <NumberInput
        label='Flight Regeneration Point'
        placeholder='200.00'
        description='The maximum amount of flight energy.'
        value={config.flightRegenerationPoint}
        onChange={(val) => handleNumberChange('flightRegenerationPoint', val)}
        decimalScale={2}
        step={1}
      />
      <Space h={space} />
      <NumberInput
        label='Flight Energy Regeneration'
        placeholder='1.00'
        description='The rate at which energy is regenerated per tick.'
        value={config.flightEnergyRegeneration}
        onChange={(val) => handleNumberChange('flightEnergyRegeneration', val)}
        decimalScale={2}
        step={0.1}
      />
      <Space h={space} />
      <NumberInput
        label='Flight Energy Depletion X/Z Multiplier'
        placeholder='4.00'
        description='The rate at which movement on the X and Z axes depletes energy while flying.'
        value={config.flightEnergyDepletionXZMultiplier}
        onChange={(val) => handleNumberChange('flightEnergyDepletionXZMultiplier', val)}
        decimalScale={2}
        step={0.1}
      />
      <Space h={space} />
      <NumberInput
        label='Flight Energy Depletion Y Multiplier'
        placeholder='10.00'
        description='The rate at which movement on the Y axes depletes energy while flying.'
        value={config.flightEnergyDepletionYMultiplier}
        onChange={(val) => handleNumberChange('flightEnergyDepletionYMultiplier', val)}
        decimalScale={2}
        step={0.1}
      />
    </Fieldset>
  );
}

export default memo(FlightFieldset);
