import { useState, useEffect } from 'react';
import { Button, Space, Text, Title, Divider, Checkbox, Group, NumberInput, TextInput, Select, Textarea, Fieldset, PasswordInput, Alert, LoadingOverlay, Badge } from '@mantine/core';
import { exportServerProperties, fetchServerProperties, subscribeToServerConfigChanges } from '@/utils/serverPropertiesExporter';
import { IconCheck, IconAlertCircle, IconRefresh, IconDeviceFloppy } from '@tabler/icons-react';

interface ServerConfigTabProps {
  space: string;
}

// Default Minecraft server properties
const defaultServerProperties = {
  // Boolean properties
  acceptsTransfers: false,
  allowFlight: false,
  allowNether: true,
  broadcastConsoleToOps: true,
  broadcastRconToOps: true,
  enableCommandBlock: false,
  enableJmxMonitoring: false,
  enableQuery: false,
  enableRcon: false,
  enableStatus: true,
  enforceSecureProfile: true,
  enforceWhitelist: false,
  forceGamemode: false,
  generateStructures: true,
  hardcore: false,
  hideOnlinePlayers: false,
  logIps: true,
  onlineMode: true,
  preventProxyConnections: false,
  pvp: true,
  requireResourcePack: false,
  spawnMonsters: true,
  syncChunkWrites: true,
  useNativeTransport: true,
  whiteList: false,

  // Number properties
  entityBroadcastRangePercentage: 100,
  functionPermissionLevel: 2,
  maxChainedNeighborUpdates: 1000000,
  maxPlayers: 20,
  maxTickTime: 60000,
  maxWorldSize: 29999984,
  networkCompressionThreshold: 256,
  opPermissionLevel: 4,
  pauseWhenEmptySeconds: 60,
  playerIdleTimeout: 0,
  queryPort: 25565,
  rateLimit: 0,
  rconPort: 25575,
  simulationDistance: 10,
  spawnProtection: 16,
  textFilteringVersion: 0,
  viewDistance: 10,
  serverPort: 25565,

  // String properties
  bugReportLink: '',
  difficulty: 'easy',
  gamemode: 'survival',
  generatorSettings: '{}',
  initialDisabledPacks: '',
  initialEnabledPacks: 'vanilla',
  levelName: 'world',
  levelSeed: '',
  levelType: 'minecraft\\:normal',
  motd: 'A Minecraft Server',
  rconPassword: '',
  regionFileCompression: 'deflate',
  resourcePack: '',
  resourcePackId: '',
  resourcePackPrompt: '',
  resourcePackSha1: '',
  serverIp: '',
  textFilteringConfig: '',
};

export function ServerConfigTab({ space }: ServerConfigTabProps) {
  const [serverProps, setServerProps] = useState(defaultServerProperties);
  const [originalProps, setOriginalProps] = useState<Record<string, any> | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch server properties on mount
  useEffect(() => {
    const fetchProps = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const props = await fetchServerProperties();

        if (Object.keys(props).length > 0) {
          // Merge with defaults to ensure all fields exist
          setServerProps({ ...defaultServerProperties, ...props });
          setOriginalProps({ ...props });
        } else {
          // If no properties found, use defaults
          setServerProps(defaultServerProperties);
          setOriginalProps({ ...defaultServerProperties });
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching server properties:', error);
        setFetchError(error instanceof Error ? error.message : 'Failed to load server properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProps();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToServerConfigChanges(async (data) => {
      console.log('Server config changed:', data);

      // Only update if we're not in the middle of an export operation
      if (!isExporting) {
        try {
          const props = await fetchServerProperties();
          if (Object.keys(props).length > 0) {
            setServerProps({ ...defaultServerProperties, ...props });
            setOriginalProps({ ...props });
            setLastUpdated(new Date());
          }
        } catch (error) {
          console.error('Error handling real-time update:', error);
        }
      }
    });

    return unsubscribe;
  }, [isExporting]);

  // Handle checkbox (boolean) changes
  const handleBooleanChange = (field: keyof typeof serverProps) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerProps({ ...serverProps, [field]: event.currentTarget.checked });
  };

  // Handle number input changes
  const handleNumberChange = (field: keyof typeof serverProps) => (value: string | number) => {
    if (value === '') {
      setServerProps({ ...serverProps, [field]: 0 });
    } else if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      setServerProps({ ...serverProps, [field]: isNaN(parsed) ? 0 : parsed });
    } else {
      setServerProps({ ...serverProps, [field]: value });
    }
  };

  // Handle text input changes
  const handleTextChange = (field: keyof typeof serverProps) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerProps({ ...serverProps, [field]: event.currentTarget.value });
  };

  // Handle select changes
  const handleSelectChange = (field: keyof typeof serverProps) => (value: string | null) => {
    if (value) {
      setServerProps({ ...serverProps, [field]: value });
    }
  };

  // Handle Apply button click
  const handleApply = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      // Export server properties and upload to PocketBase
      await exportServerProperties(serverProps);

      // Update original props to match current props
      setOriginalProps({ ...serverProps });

      // Show success message
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);

      // Update last updated timestamp
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error applying server configuration:', error);
      setExportError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Revert button click
  const handleRevert = () => {
    if (originalProps) {
      setServerProps({ ...defaultServerProperties, ...originalProps });
    }
  };

  // Handle Refresh button click to fetch the latest properties
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);

      const props = await fetchServerProperties();

      if (Object.keys(props).length > 0) {
        setServerProps({ ...defaultServerProperties, ...props });
        setOriginalProps({ ...props });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error refreshing server properties:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to refresh server properties');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the current state is different from the original fetched state
  const hasChanges = () => {
    if (!originalProps) return false;

    // Compare important properties
    for (const key in serverProps) {
      if (key in originalProps && JSON.stringify(serverProps[key as keyof typeof serverProps]) !== JSON.stringify(originalProps[key])) {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <Space h={space} />
      <Title order={2}>Server Configuration</Title>
      <Text size="md">Configure the PaperMC server.</Text>
      <Space h={space} />
      <Divider />
      <Space h={space} />

      {/* Relative position needed for the LoadingOverlay */}
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        {exportSuccess && (
          <Alert icon={<IconCheck size={16} />} title="Success" color="green" withCloseButton onClose={() => setExportSuccess(false)} mb={space}>
            Server properties exported and uploaded successfully!
          </Alert>
        )}

        {exportError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={() => setExportError(null)} mb={space}>
            {exportError}
          </Alert>
        )}

        {fetchError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={() => setFetchError(null)} mb={space}>
            {fetchError}
          </Alert>
        )}

        <Group justify="space-between" mb={space}>
          {lastUpdated && (
            <Text size="sm" color="dimmed">
              Last updated: {lastUpdated.toLocaleString()}
            </Text>
          )}

          <Group gap="xs">
            {hasChanges() && (
              <Badge color="yellow" variant="filled">Unsaved Changes</Badge>
            )}
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="subtle"
              onClick={handleRefresh}
              loading={isLoading}
              disabled={isExporting}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {/* Basic Settings */}
        <Fieldset legend="Basic Settings">
          <TextInput
            label="Server MOTD"
            description="Message of the day"
            value={serverProps.motd}
            onChange={handleTextChange('motd')}
          />
          <Space h={space} />

          <NumberInput
            label="Max Players"
            description="Maximum number of players allowed on the server"
            value={serverProps.maxPlayers}
            onChange={handleNumberChange('maxPlayers')}
            min={1}
          />
          <Space h={space} />

          <Select
            label="Difficulty"
            description="Game difficulty"
            value={serverProps.difficulty}
            onChange={handleSelectChange('difficulty')}
            data={[
              { value: 'peaceful', label: 'Peaceful' },
              { value: 'easy', label: 'Easy' },
              { value: 'normal', label: 'Normal' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
          <Space h={space} />

          <Select
            label="Gamemode"
            description="Default game mode"
            value={serverProps.gamemode}
            onChange={handleSelectChange('gamemode')}
            data={[
              { value: 'survival', label: 'Survival' },
              { value: 'creative', label: 'Creative' },
              { value: 'adventure', label: 'Adventure' },
              { value: 'spectator', label: 'Spectator' },
            ]}
          />
          <Space h={space} />

          <Checkbox
            label="PVP"
            description="Allow players to combat each other"
            checked={serverProps.pvp}
            onChange={handleBooleanChange('pvp')}
          />
          <Space h={space} />

          <Checkbox
            label="Spawn Monsters"
            description="Whether monsters will spawn"
            checked={serverProps.spawnMonsters}
            onChange={handleBooleanChange('spawnMonsters')}
          />
        </Fieldset>

        <Space h={space} />

        {/* World Settings */}
        <Fieldset legend="World Settings">
          <TextInput
            label="Level Name"
            description="World folder name"
            value={serverProps.levelName}
            onChange={handleTextChange('levelName')}
          />
          <Space h={space} />

          <TextInput
            label="Seed"
            description="World generation seed"
            value={serverProps.levelSeed}
            onChange={handleTextChange('levelSeed')}
          />
          <Space h={space} />

          <TextInput
            label="Level Type"
            description="World generation type"
            value={serverProps.levelType}
            onChange={handleTextChange('levelType')}
          />
          <Space h={space} />

          <Textarea
            label="Generator Settings"
            description="Custom world generator settings (JSON)"
            value={serverProps.generatorSettings}
            onChange={(e) => setServerProps({ ...serverProps, generatorSettings: e.currentTarget.value })}
          />
          <Space h={space} />

          <Checkbox
            label="Generate Structures"
            description="Whether to generate structures (villages, temples, etc.)"
            checked={serverProps.generateStructures}
            onChange={handleBooleanChange('generateStructures')}
          />
          <Space h={space} />

          <NumberInput
            label="Max World Size"
            description="Maximum allowed size of the world, in blocks (from center)"
            value={serverProps.maxWorldSize}
            onChange={handleNumberChange('maxWorldSize')}
            min={1}
          />
        </Fieldset>

        <Space h={space} />

        {/* Network Settings */}
        <Fieldset legend="Network Settings">
          <TextInput
            label="Server IP"
            description="IP to bind the server to (leave empty for all interfaces)"
            value={serverProps.serverIp}
            onChange={handleTextChange('serverIp')}
          />
          <Space h={space} />

          <NumberInput
            label="Server Port"
            description="Port to listen on"
            value={serverProps.serverPort}
            onChange={handleNumberChange('serverPort')}
            min={1}
            max={65535}
          />
          <Space h={space} />

          <Checkbox
            label="Online Mode"
            description="Whether to check connecting players against Minecraft account database"
            checked={serverProps.onlineMode}
            onChange={handleBooleanChange('onlineMode')}
          />
          <Space h={space} />

          <Checkbox
            label="Prevent Proxy Connections"
            description="Block connections from proxy servers"
            checked={serverProps.preventProxyConnections}
            onChange={handleBooleanChange('preventProxyConnections')}
          />
          <Space h={space} />

          <NumberInput
            label="Network Compression Threshold"
            description="Network compression threshold (0 to disable, -1 for everything)"
            value={serverProps.networkCompressionThreshold}
            onChange={handleNumberChange('networkCompressionThreshold')}
          />
          <Space h={space} />

          <NumberInput
            label="Rate Limit"
            description="Rate limit for connections"
            value={serverProps.rateLimit}
            onChange={handleNumberChange('rateLimit')}
            min={0}
          />
        </Fieldset>

        <Space h={space} />

        {/* Performance Settings */}
        <Fieldset legend="Performance Settings">
          <NumberInput
            label="View Distance"
            description="Radius of chunks the server will send to players"
            value={serverProps.viewDistance}
            onChange={handleNumberChange('viewDistance')}
            min={3}
            max={32}
          />
          <Space h={space} />

          <NumberInput
            label="Simulation Distance"
            description="Radius of chunks the server will simulate"
            value={serverProps.simulationDistance}
            onChange={handleNumberChange('simulationDistance')}
            min={3}
            max={32}
          />
          <Space h={space} />

          <NumberInput
            label="Max Tick Time"
            description="Maximum milliseconds a single tick may take (0 to disable)"
            value={serverProps.maxTickTime}
            onChange={handleNumberChange('maxTickTime')}
            min={0}
          />
          <Space h={space} />

          <NumberInput
            label="Entity Broadcast Range Percentage"
            description="Controls how far entities are visible (higher values = further)"
            value={serverProps.entityBroadcastRangePercentage}
            onChange={handleNumberChange('entityBroadcastRangePercentage')}
            min={0}
            max={500}
          />
          <Space h={space} />

          <NumberInput
            label="Max Chained Neighbor Updates"
            description="Limits chain reactions in block updates (lower value = better performance)"
            value={serverProps.maxChainedNeighborUpdates}
            onChange={handleNumberChange('maxChainedNeighborUpdates')}
            min={1}
          />
          <Space h={space} />

          <Checkbox
            label="Sync Chunk Writes"
            description="Whether to sync chunk writes to disk immediately"
            checked={serverProps.syncChunkWrites}
            onChange={handleBooleanChange('syncChunkWrites')}
          />
          <Space h={space} />

          <Checkbox
            label="Use Native Transport"
            description="Whether to use native transport optimization (Linux only)"
            checked={serverProps.useNativeTransport}
            onChange={handleBooleanChange('useNativeTransport')}
          />
          <Space h={space} />

          <Select
            label="Region File Compression"
            description="Compression type for region files"
            value={serverProps.regionFileCompression}
            onChange={handleSelectChange('regionFileCompression')}
            data={[
              { value: 'deflate', label: 'Deflate' },
              { value: 'none', label: 'None' },
            ]}
          />
        </Fieldset>

        <Space h={space} />

        {/* Resource Pack Settings */}
        <Fieldset legend="Resource Pack Settings">
          <TextInput
            label="Resource Pack URL"
            description="URL to a resource pack"
            value={serverProps.resourcePack}
            onChange={handleTextChange('resourcePack')}
          />
          <Space h={space} />

          <TextInput
            label="Resource Pack SHA-1"
            description="SHA-1 digest of the resource pack"
            value={serverProps.resourcePackSha1}
            onChange={handleTextChange('resourcePackSha1')}
          />
          <Space h={space} />

          <TextInput
            label="Resource Pack ID"
            description="Unique identifier for the resource pack"
            value={serverProps.resourcePackId}
            onChange={handleTextChange('resourcePackId')}
          />
          <Space h={space} />

          <TextInput
            label="Resource Pack Prompt"
            description="Text shown to players when prompted to download the resource pack"
            value={serverProps.resourcePackPrompt}
            onChange={handleTextChange('resourcePackPrompt')}
          />
          <Space h={space} />

          <Checkbox
            label="Require Resource Pack"
            description="Kick players who don't accept the resource pack"
            checked={serverProps.requireResourcePack}
            onChange={handleBooleanChange('requireResourcePack')}
          />
        </Fieldset>

        <Space h={space} />

        {/* Security Settings */}
        <Fieldset legend="Security Settings">
          <NumberInput
            label="Spawn Protection"
            description="Radius around spawn that only ops can modify (0 to disable)"
            value={serverProps.spawnProtection}
            onChange={handleNumberChange('spawnProtection')}
            min={0}
          />
          <Space h={space} />

          <NumberInput
            label="OP Permission Level"
            description="Permission level for ops (1-4)"
            value={serverProps.opPermissionLevel}
            onChange={handleNumberChange('opPermissionLevel')}
            min={1}
            max={4}
          />
          <Space h={space} />

          <NumberInput
            label="Function Permission Level"
            description="Permission level for function execution (1-4)"
            value={serverProps.functionPermissionLevel}
            onChange={handleNumberChange('functionPermissionLevel')}
            min={1}
            max={4}
          />
          <Space h={space} />

          <Checkbox
            label="White List"
            description="Whether to enable the server whitelist"
            checked={serverProps.whiteList}
            onChange={handleBooleanChange('whiteList')}
          />
          <Space h={space} />

          <Checkbox
            label="Enforce Whitelist"
            description="Whether to enforce the whitelist"
            checked={serverProps.enforceWhitelist}
            onChange={handleBooleanChange('enforceWhitelist')}
          />
          <Space h={space} />

          <Checkbox
            label="Enforce Secure Profile"
            description="Enforce secure profiles for player authentication"
            checked={serverProps.enforceSecureProfile}
            onChange={handleBooleanChange('enforceSecureProfile')}
          />
          <Space h={space} />

          <Checkbox
            label="Log IPs"
            description="Whether to log player IP addresses"
            checked={serverProps.logIps}
            onChange={handleBooleanChange('logIps')}
          />
          <Space h={space} />

          <TextInput
            label="Text Filtering Config"
            description="Configuration for text filtering"
            value={serverProps.textFilteringConfig}
            onChange={handleTextChange('textFilteringConfig')}
          />
          <Space h={space} />

          <NumberInput
            label="Text Filtering Version"
            description="Version of text filtering to use"
            value={serverProps.textFilteringVersion}
            onChange={handleNumberChange('textFilteringVersion')}
            min={0}
          />
        </Fieldset>

        <Space h={space} />

        {/* Gameplay Settings */}
        <Fieldset legend="Gameplay Settings">
          <Checkbox
            label="Allow Flight"
            description="Allow players to fly in survival mode if they have mods that provide flight"
            checked={serverProps.allowFlight}
            onChange={handleBooleanChange('allowFlight')}
          />
          <Space h={space} />

          <Checkbox
            label="Allow Nether"
            description="Allow nether world"
            checked={serverProps.allowNether}
            onChange={handleBooleanChange('allowNether')}
          />
          <Space h={space} />

          <Checkbox
            label="Enable Command Block"
            description="Whether command blocks can be used"
            checked={serverProps.enableCommandBlock}
            onChange={handleBooleanChange('enableCommandBlock')}
          />
          <Space h={space} />

          <Checkbox
            label="Force Gamemode"
            description="Force players to join in the default gamemode"
            checked={serverProps.forceGamemode}
            onChange={handleBooleanChange('forceGamemode')}
          />
          <Space h={space} />

          <Checkbox
            label="Hardcore"
            description="Whether to enable hardcore mode (permanent death)"
            checked={serverProps.hardcore}
            onChange={handleBooleanChange('hardcore')}
          />
          <Space h={space} />

          <NumberInput
            label="Player Idle Timeout"
            description="Auto-kick players idle for this many minutes (0 to disable)"
            value={serverProps.playerIdleTimeout}
            onChange={handleNumberChange('playerIdleTimeout')}
            min={0}
          />
          <Space h={space} />

          <NumberInput
            label="Pause When Empty Seconds"
            description="Pause the server when no players are online for this many seconds (0 to disable)"
            value={serverProps.pauseWhenEmptySeconds}
            onChange={handleNumberChange('pauseWhenEmptySeconds')}
            min={0}
          />
          <Space h={space} />

          <Checkbox
            label="Hide Online Players"
            description="Whether to hide online players in server status responses"
            checked={serverProps.hideOnlinePlayers}
            onChange={handleBooleanChange('hideOnlinePlayers')}
          />
          <Space h={space} />

          <Checkbox
            label="Accepts Transfers"
            description="Whether this server accepts transfers from other servers"
            checked={serverProps.acceptsTransfers}
            onChange={handleBooleanChange('acceptsTransfers')}
          />
          <Space h={space} />

          <TextInput
            label="Initial Enabled Packs"
            description="Data packs enabled by default"
            value={serverProps.initialEnabledPacks}
            onChange={handleTextChange('initialEnabledPacks')}
          />
          <Space h={space} />

          <TextInput
            label="Initial Disabled Packs"
            description="Data packs disabled by default"
            value={serverProps.initialDisabledPacks}
            onChange={handleTextChange('initialDisabledPacks')}
          />
          <Space h={space} />

          <TextInput
            label="Bug Report Link"
            description="Link to report bugs"
            value={serverProps.bugReportLink}
            onChange={handleTextChange('bugReportLink')}
          />
        </Fieldset>

        <Space h={space} />

        {/* RCON & Query Settings */}
        <Fieldset legend="RCON & Query Settings">
          <Checkbox
            label="Enable RCON"
            description="Whether to enable remote console access"
            checked={serverProps.enableRcon}
            onChange={handleBooleanChange('enableRcon')}
          />
          <Space h={space} />

          <PasswordInput
            label="RCON Password"
            description="Password for RCON access"
            value={serverProps.rconPassword}
            onChange={(e) => setServerProps({ ...serverProps, rconPassword: e.currentTarget.value })}
            disabled={!serverProps.enableRcon}
          />
          <Space h={space} />

          <NumberInput
            label="RCON Port"
            description="Port for RCON access"
            value={serverProps.rconPort}
            onChange={handleNumberChange('rconPort')}
            min={1}
            max={65535}
            disabled={!serverProps.enableRcon}
          />
          <Space h={space} />

          <Checkbox
            label="Broadcast RCON to OPs"
            description="Whether to broadcast RCON commands to server operators"
            checked={serverProps.broadcastRconToOps}
            onChange={handleBooleanChange('broadcastRconToOps')}
            disabled={!serverProps.enableRcon}
          />
          <Space h={space} />

          <Checkbox
            label="Broadcast Console to OPs"
            description="Whether to broadcast console commands to server operators"
            checked={serverProps.broadcastConsoleToOps}
            onChange={handleBooleanChange('broadcastConsoleToOps')}
          />
          <Space h={space} />

          <Checkbox
            label="Enable Query"
            description="Whether to enable GameSpy4 protocol server"
            checked={serverProps.enableQuery}
            onChange={handleBooleanChange('enableQuery')}
          />
          <Space h={space} />

          <NumberInput
            label="Query Port"
            description="Port for query protocol"
            value={serverProps.queryPort}
            onChange={handleNumberChange('queryPort')}
            min={1}
            max={65535}
            disabled={!serverProps.enableQuery}
          />
          <Space h={space} />

          <Checkbox
            label="Enable Status"
            description="Whether the server sends status responses"
            checked={serverProps.enableStatus}
            onChange={handleBooleanChange('enableStatus')}
          />
          <Space h={space} />

          <Checkbox
            label="Enable JMX Monitoring"
            description="Whether to enable JMX monitoring"
            checked={serverProps.enableJmxMonitoring}
            onChange={handleBooleanChange('enableJmxMonitoring')}
          />
        </Fieldset>

        <Space h={space} />
        <Divider />
        <Space h={space} />

        <Group>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleApply}
            loading={isExporting}
            disabled={isLoading || !hasChanges()}
          >
            {isExporting ? 'Applying...' : 'Apply Changes'}
          </Button>
          <Button
            variant="light"
            onClick={handleRevert}
            disabled={isLoading || !hasChanges()}
          >
            Revert Changes
          </Button>
        </Group>
      </div>
    </>
  );
}
