import React, { memo } from 'react';
import { Fieldset, NumberInput, Space } from '@mantine/core';
import { SelectCategory } from '@/components/SelectGroupsSearchable/SelectCategory';
import { useDebouncedCallback } from '@mantine/hooks';

interface InfractionsFieldsetProps {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  space: string;
}

// Memoize the SelectCategory to prevent unnecessary re-renders
const MemoizedSelectCategory = memo(SelectCategory);

function InfractionsFieldset({ config, setConfig, space }: InfractionsFieldsetProps) {
  // Debounce number input changes
  const handleNumberChange = useDebouncedCallback((value: number | string | null) => {
    setConfig((prev: any) => ({ ...prev, infractionExpireTimeDays: Number(value) }));
  }, 300);

  return (
    <Fieldset legend="Infractions">
      <NumberInput
        label='Infraction Expire Time'
        placeholder='90'
        description='The amount of time in days (as an integer) that infractions take to expire.'
        value={config.infractionExpireTimeDays}
        onChange={handleNumberChange}
      />
      <Space h={space} />
      <MemoizedSelectCategory
        label='Infractions Category'
        description='The ID of the category to create infractions channels. They will accumulate here.'
        value={config.infractionsCategory}
        onChange={(val: number | null) => setConfig((prev: any) => ({ ...prev, infractionsCategory: val }))}
      />
    </Fieldset>
  );
}

export default memo(InfractionsFieldset);
