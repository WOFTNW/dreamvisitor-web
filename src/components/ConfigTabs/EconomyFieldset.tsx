import React, { memo } from 'react';
import { Fieldset, TextInput, NumberInput, Space } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

interface EconomyFieldsetProps {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  space: string;
}

function EconomyFieldset({ config, setConfig, space }: EconomyFieldsetProps) {
  // Debounce input changes to reduce re-renders
  const handleNumberChange = useDebouncedCallback((field: string, value: string | number | null) => {
    setConfig((prev: any) => ({ ...prev, [field]: Number(value) }));
  }, 300);

  const handleTextChange = useDebouncedCallback((field: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }));
  }, 300);

  return (
    <Fieldset legend="Economy">
      <TextInput
        label='Shop Name'
        placeholder='Shop'
        description='The name of the Discord shop. This will appear at the top of the embed.'
        value={config.shopName}
        onChange={(e) => handleTextChange('shopName', e.currentTarget.value)}
      />
      <Space h={space} />
      <TextInput
        label='Currency Icon'
        placeholder='$'
        description='The icon used for currency in the Discord economy system. This can be any string, including symbols, letters, emojis, and Discord custom emoji.'
        value={config.currencyIcon}
        onChange={(e) => handleTextChange('currencyIcon', e.currentTarget.value)}
      />
      <Space h={space} />
      <NumberInput
        label='Daily Base Amount'
        placeholder='10.00'
        description='The base amount given by the /daily Discord command. This is the default amount before adding the streak bonus.'
        value={config.dailyBaseAmount}
        onChange={(val) => handleNumberChange('dailyBaseAmount', val)}
        decimalScale={2}
        step={0.01}
      />
      <Space h={space} />
      <NumberInput
        label='Daily Streak Multiplier'
        placeholder='5.00'
        description='The multiplier of the streak bonus given by the /daily command.'
        value={config.dailyStreakMultiplier}
        onChange={(val) => handleNumberChange('dailyStreakMultiplier', val)}
        decimalScale={2}
        step={0.01}
      />
      <Space h={space} />
      <NumberInput
        label='Work Reward'
        placeholder='20.00'
        description='The amount gained from the /work command. /work can only be run every hour.'
        value={config.workReward}
        onChange={(val) => handleNumberChange('workReward', val)}
        decimalScale={2}
        step={0.01}
      />
    </Fieldset>
  );
}

export default memo(EconomyFieldset);
