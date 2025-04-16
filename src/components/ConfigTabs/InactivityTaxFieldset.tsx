import React, { memo } from 'react';
import { Fieldset, TextInput, NumberInput, Space } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

interface InactivityTaxFieldsetProps {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  space: string;
}

function InactivityTaxFieldset({ config, setConfig, space }: InactivityTaxFieldsetProps) {
  // Debounce input changes to reduce re-renders
  const handleNumberChange = useDebouncedCallback((field: string, value: string | number | null) => {
    setConfig((prev: any) => ({ ...prev, [field]: Number(value) }));
  }, 300);

  const handleTextChange = useDebouncedCallback((field: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  }, 300);

  return (
    <Fieldset legend="InactivityTax">
      <NumberInput
        label='Days Until Inactive Tax'
        placeholder='60'
        description='The days a player can be offline until the inactivity tax applies.'
        value={config.daysUntilInactiveTax}
        onChange={(val) => handleNumberChange('daysUntilInactiveTax', val)}
        decimalScale={0}
        step={1}
      />
      <Space h={space} />
      <NumberInput
        label='Inactive Tax Percent'
        placeholder='0.1'
        description='The percent to tax inactive players, between 0.0 and 1.0.'
        value={config.inactiveTaxPercent}
        onChange={(val) => handleNumberChange('inactiveTaxPercent', val)}
        decimalScale={2}
        step={0.01}
      />
      <Space h={space} />
      <NumberInput
        label='Inactive Day Frequency'
        placeholder='7'
        description='The time in days between inactivity taxes. 0 to disable.'
        value={config.inactiveDayFrequency}
        onChange={(val) => handleNumberChange('inactiveDayFrequency', val)}
        decimalScale={0}
        step={1}
      />
      <Space h={space} />
      <NumberInput
        label='Inactive Tax Stop'
        placeholder='50000'
        description='The lowest a balance can be depleted to by inactivity taxes.'
        value={config.inactiveTaxStop}
        onChange={(val) => handleNumberChange('inactiveTaxStop', val)}
        decimalScale={0}
        step={100}
      />
      <Space h={space} />
      <NumberInput
        label='Last Inactive Tax'
        placeholder='0'
        description='The last time the inactive tax occurred. This should not be manually tampered with.'
        value={config.lastInactiveTax}
        onChange={(val) => handleNumberChange('lastInactiveTax', val)}
        decimalScale={0}
        step={0}
      />
    </Fieldset>
  );
}

export default memo(InactivityTaxFieldset);
