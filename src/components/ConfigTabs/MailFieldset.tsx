import React, { memo } from 'react';
import { Fieldset, NumberInput, Space, Skeleton } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';

// Define explicit types instead of using 'any'
interface MailConfig {
  mailDeliveryLocationSelectionDistanceWeightMultiplier: number;
  mailDistanceToRewardMultiplier: number;
}

interface MailFieldsetProps {
  config: MailConfig;
  setConfig: React.Dispatch<React.SetStateAction<MailConfig>>;
  space: string;
  loading?: boolean;
}

function MailFieldset({
  config,
  setConfig,
  space,
  loading = false
}: MailFieldsetProps) {
  // Debounce number input changes
  const handleNumberChange = useDebouncedCallback((field: keyof MailConfig, value: number | string | null) => {
    setConfig((prev: MailConfig) => ({ ...prev, [field]: Number(value) }));
  }, 300);

  // Default values to prevent undefined errors and UI jumping
  const distanceMultiplier = config?.mailDeliveryLocationSelectionDistanceWeightMultiplier ?? 1.0;
  const rewardMultiplier = config?.mailDistanceToRewardMultiplier ?? 0.05;

  // Render skeleton UI when loading to prevent layout shifts
  if (loading) {
    return (
      <Fieldset legend="Mail">
        <Skeleton height={70} mb={space} />
        <Skeleton height={70} />
      </Fieldset>
    );
  }

  return (
    <Fieldset legend="Mail">
      <NumberInput
        label='Mail Delivery Location Selection Distance Weight Multiplier'
        placeholder='1.00'
        description='The multiplier of the distance weight when choosing mail delivery locations.'
        value={distanceMultiplier}
        onChange={(val) => handleNumberChange('mailDeliveryLocationSelectionDistanceWeightMultiplier', val)}
        decimalScale={2}
        step={0.01}
      />
      <Space h={space} />
      <NumberInput
        label='Mail Distance To Reward Multiplier'
        placeholder='0.05'
        description='Mail delivery reward is calculated by multiplying the distance by this number.'
        value={rewardMultiplier}
        onChange={(val) => handleNumberChange('mailDistanceToRewardMultiplier', val)}
        decimalScale={2}
        step={0.01}
      />
    </Fieldset>
  );
}

// Use React.memo with a custom comparison function for better performance
export default memo(MailFieldset, (prevProps, nextProps) => {
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.space === nextProps.space &&
    prevProps.config?.mailDeliveryLocationSelectionDistanceWeightMultiplier ===
    nextProps.config?.mailDeliveryLocationSelectionDistanceWeightMultiplier &&
    prevProps.config?.mailDistanceToRewardMultiplier ===
    nextProps.config?.mailDistanceToRewardMultiplier
  );
});
