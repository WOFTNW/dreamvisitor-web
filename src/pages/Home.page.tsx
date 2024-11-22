import { NavbarSimple } from '@/components/NavbarSimple/NavbarSimple';
import { Button, Grid, Group, NumberInput, Paper, Space, Text, Title, Tooltip } from '@mantine/core';

export function HomePage() {

  let player_count = 0;
  let tps = 0;
  let mspt = 0;
  let player_limit = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <NavbarSimple page="Home" />
      <div style={{ margin: 'var(--mantine-spacing-xl)' }}>
        <Grid align="stretch" grow>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>Player count</Title>
              <Space h='sm'></Space>
              <Title>
                {player_count}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>TPS</Title>
              <Space h='sm'></Space>
              <Title>
                {tps}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>MSPT</Title>
              <Space h='sm'></Space>
              <Title>
                {mspt}
              </Title>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper shadow="xs" p="xl" h={'100%'}>
              <Title order={3}>Player limit</Title>
              <Space h='sm'></Space>
              <Tooltip label="Waiting for player limit">
                <NumberInput disabled={true} defaultValue={player_limit}></NumberInput>
              </Tooltip>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}
