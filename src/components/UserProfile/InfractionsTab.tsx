import { InfractionList } from '@/components/InfractionList/InfractionList';
import { Infraction } from '@/types/models';
import { Button, Paper, Space } from '@mantine/core';

interface InfractionsTabProps {
  infractions: Infraction[];
  onNewInfraction: () => void;
  onEditInfraction?: (infraction: Infraction) => void;
}

export function InfractionsTab({ infractions, onNewInfraction, onEditInfraction }: InfractionsTabProps) {
  return (
    <>
      <Space h="md" />
      <Paper p="md" withBorder>
        <InfractionList infractions={infractions} onEdit={onEditInfraction} />
      </Paper>
      <Space h="md" />
      <Button onClick={onNewInfraction}>New Infraction</Button>
    </>
  );
}
