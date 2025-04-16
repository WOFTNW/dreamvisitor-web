import { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { LocationInput } from '@/components/LocationInput/LocationInput';
import { SelectChannel } from '@/components/SelectGroupsSearchable/SelectChannel';
import { Button, Checkbox, Divider, Fieldset, Group, Loader, NumberInput, Space, Text, TextInput, Title, Alert, LoadingOverlay, Badge } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { pb } from '@/lib/pocketbase';
import { IconCheck, IconAlertCircle, IconRefresh, IconDeviceFloppy } from '@tabler/icons-react';

// Helper function to convert snake_case to camelCase
const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}

// Lazy load fieldsets to improve initial load time
const EconomyFieldset = lazy(() => import('./EconomyFieldset'));
const InfractionsFieldset = lazy(() => import('./InfractionsFieldset'));
const MailFieldset = lazy(() => import('./MailFieldset'));

// Using memo to prevent unnecessary re-renders
const MemoizedLocationInput = memo(LocationInput);
const MemoizedSelectChannel = memo(SelectChannel);

interface DreamvisitorConfigTabProps {
  space: string;
}

interface Location {
  x: number | null;
  y: number | null;
  z: number | null;
  pitch: number | null;
  yaw: number | null;
  world: string | null;
}

interface ConfigState {
  id?: string;
  debug: boolean;
  pauseChat: boolean;
  softWhitelist: boolean;
  disablePvP: boolean;
  playerLimit: number;
  resourcePackRepo: string | null;
  hubLocation: Location | null;
  whitelistChannel: number | null;
  gameChatChannel: number | null;
  gameLogChannel: number | null;
  logConsole: boolean;
  enableLogConsoleCommands: boolean;
  webWhitelistEnabled: boolean;
  websiteUrl: string;
  infractionExpireTimeDays: number;
  infractionsCategory: number | null;
  shopName: string;
  currencyIcon: string;
  dailyBaseAmount: number;
  dailyStreakMultiplier: number;
  workReward: number;
  mailDeliveryLocationSelectionDistanceWeightMultiplier: number;
  mailDistanceToRewardMultiplier: number;
  consoleSize: number;
}

// Basic settings component to reduce main component size
const BasicSettings = memo(({ config, setConfig, space }: {
  config: ConfigState,
  setConfig: React.Dispatch<React.SetStateAction<ConfigState>>,
  space: string
}) => {
  const handleNumberChange = useDebouncedCallback((field: keyof ConfigState, value: number | null) => {
    setConfig(prev => ({ ...prev, [field]: value === null ? 0 : value }));
  }, 300);

  const handleTextChange = useDebouncedCallback((field: keyof ConfigState, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  }, 300);

  // Make sure config is safe to use
  if (!config) return null;

  return (
    <>
      <Checkbox
        label='Debug Mode'
        description='Whether to enable debug messages. This will send additional messages to help debug Dreamvisitor. Disabled by default.'
        checked={config.debug ?? false}
        onChange={(e) => {
          const { checked } = e.currentTarget;
          setConfig(prev => ({ ...prev, debug: checked }))
        }}
      />
      <Space h={space} />
      <Checkbox
        label='Pause Chat'
        description='Whether chat is paused or not. This can be toggled in Minecraft with /pausechat. Disabled by default.'
        checked={config.pauseChat ?? false}
        onChange={(e) => {
          const { checked } = e.currentTarget;
          setConfig(prev => ({ ...prev, pauseChat: checked }))
        }}
      />
      <Space h={space} />
      <Checkbox
        label='Soft Whitelist'
        description='Whether the soft whitelist is enabled or not. This can be set in Minecraft with /softwhitelist [on|off]. Disabled by default.'
        checked={config.softWhitelist ?? false}
        onChange={(e) => {
          const { checked } = e.currentTarget;
          setConfig(prev => ({ ...prev, softWhitelist: checked }))
        }}
      />
      <Space h={space} />
      <Checkbox
        label='Disable PvP'
        description='Whether to globally disable pvp or not. This can be toggled in Minecraft with /togglepvp.'
        checked={config?.disablePvP ?? false}
        onChange={(e) => {
          const { checked } = e.currentTarget;
          setConfig(prev => ({ ...prev, disablePvP: checked }))
        }}
      />
      <Space h={space} />
      <NumberInput
        label='Player Limit Override'
        description='Player limit override. This will override the player limit, both over and under. This can be set in Minecraft with /playerlimit <int>'
        value={config?.playerLimit ?? 0}
        onChange={(val) => handleNumberChange('playerLimit', val === "" ? 0 : Number(val))}
      />
      <Space h={space} />
      <TextInput
        label='Resource Pack Repository'
        placeholder='WOFTNW/Dragonspeak'
        description='The repository path of the server resource pack. Dreamvisitor will pull the first artifact from the latest release on pack update.'
        value={config?.resourcePackRepo || ''}
        onChange={(e) => {
          const { value } = e.currentTarget;
          setConfig(prev => ({ ...prev, resourcePackRepo: value }))
        }}
      />
    </>
  );
});

// Bot configuration component
const BotConfig = memo(({ config, setConfig, space }: {
  config: ConfigState,
  setConfig: React.Dispatch<React.SetStateAction<ConfigState>>,
  space: string
}) => {
  return (
    <Fieldset legend="Bot">
      <Space h={space} />
      <MemoizedSelectChannel
        label='Whitelist Channel'
        description='The channel of the whitelist chat. This can be set on Discord with /setwhitelist.'
        value={config?.whitelistChannel ?? null}
        onChange={(val: string | number) => setConfig(prev => ({ ...prev, whitelistChannel: typeof val === 'string' ? Number(val) : val }))}
      />
      <Space h={space} />
      <MemoizedSelectChannel
        label='Game Chat Channel'
        description='The channel of the game chat. This can be set on Discord with /setgamechat.'
        value={config?.gameChatChannel ?? null}
        onChange={(val: string | number) => setConfig(prev => ({ ...prev, gameChatChannel: typeof val === 'string' ? Number(val) : val }))}
      />
      <Space h={space} />
      <MemoizedSelectChannel
        label='Log Channel'
        description='The channel of the log chat. This can be set on Discord with /setlogchat.'
        value={config?.gameLogChannel ?? null}
        onChange={(val: string | number) => setConfig(prev => ({ ...prev, gameLogChannel: typeof val === 'string' ? Number(val) : val }))}
      />
      <Space h={space} />
      <Checkbox
        label='Log Console'
        description='Whether to copy the output of the console to the Discord log channel. This will disable the default Dreamvisitor logging in place of the Minecraft server console.'
        checked={config?.logConsole ?? false}
        onChange={(e) => {
          const { checked } = e.currentTarget;
          setConfig(prev => ({ ...prev, logConsole: checked }))
        }}
      />
      <Space h={space} />
      <Checkbox
        label='Enable Log Console Commands'
        description='Whether to pass messages in the log channel as console commands. If log-console is enabled, this will take messages sent by users with the Discord administrator permission and pass them as console commands.'
        checked={config?.enableLogConsoleCommands ?? true}
        onChange={(e) => {
          const { checked } = e.currentTarget;
          setConfig(prev => ({ ...prev, enableLogConsoleCommands: checked }))
        }}
      />
      <Space h={space} />
      <NumberInput
        label='Console Size'
        description='The maximum number of lines to store in the console buffer.'
        value={config?.consoleSize ?? 512}
        onChange={(val) => setConfig(prev => ({ ...prev, consoleSize: val === "" ? 512 : Number(val) }))}
      />
    </Fieldset>
  );
});

export function DreamvisitorConfigTab({ space }: DreamvisitorConfigTabProps) {
  const [config, setConfig] = useState<ConfigState>(() => ({
    debug: false,
    pauseChat: false,
    softWhitelist: false,
    disablePvP: false,
    playerLimit: -1,
    resourcePackRepo: "WOFTNW/Dragonspeak",
    hubLocation: null,
    whitelistChannel: null,
    gameChatChannel: null,
    gameLogChannel: null,
    logConsole: false,
    enableLogConsoleCommands: true,
    webWhitelistEnabled: true,
    websiteUrl: "https://woftnw.org/",
    infractionExpireTimeDays: 90,
    infractionsCategory: null,
    shopName: "Shop",
    currencyIcon: "$",
    dailyBaseAmount: 10.00,
    dailyStreakMultiplier: 5.00,
    workReward: 20.00,
    mailDeliveryLocationSelectionDistanceWeightMultiplier: 1.00,
    mailDistanceToRewardMultiplier: 0.05,
    consoleSize: 512,
  }));

  const [originalConfig, setOriginalConfig] = useState<ConfigState>({ ...config });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [externalChanges, setExternalChanges] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Convert record from PocketBase (snake_case) to our format (camelCase)
  const convertRecord = useCallback((record: any): ConfigState => {
    const result: any = { id: record.id };

    Object.keys(record).forEach(key => {
      if (key !== 'id' && key !== 'collectionId' && key !== 'collectionName' && key !== 'created' && key !== 'updated') {
        const camelKey = toCamelCase(key);

        if (key === 'hub_location' && record.expand?.hub_location) {
          result.hubLocation = {
            x: record.expand.hub_location.x,
            y: record.expand.hub_location.y,
            z: record.expand.hub_location.z,
            pitch: record.expand.hub_location.pitch,
            yaw: record.expand.hub_location.yaw,
            world: record.expand.hub_location.world,
          };
        } else {
          // Ensure numeric fields are always defined
          if (['player_limit', 'console_size', 'infraction_expire_time_days'].includes(key)) {
            result[camelKey] = record[key] === null ? 0 : record[key];
          } else {
            result[camelKey] = record[key];
          }
        }
      }
    });

    return result as ConfigState;
  }, []);

  // Convert our format (camelCase) back to PocketBase format (snake_case)
  const convertToRecord = useCallback((config: ConfigState): Record<string, any> => {
    const result: Record<string, any> = {};

    Object.keys(config).forEach(key => {
      if (key !== 'id' && key !== 'hubLocation') {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = config[key as keyof ConfigState];
      } else if (key === 'hubLocation' && config.hubLocation?.world) {
        // Handle hub location relation - store the ID or create a new location
        result['hub_location'] = config.hubLocation; // We'll handle this specially in handleApply
      }
    });

    return result;
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Fetch the first config record with expanded hub_location
      const records = await pb.collection('dreamvisitor_config').getList(1, 1, {
        expand: 'hub_location'
      });

      if (records.items.length > 0) {
        const record = records.items[0];
        const configData = convertRecord(record);
        setConfig(configData);
        setOriginalConfig({ ...configData });
        setLastUpdated(new Date());
      } else {
        console.warn('No configuration records found');
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, [convertRecord]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Subscribe to real-time updates
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    try {
      // Only set up subscription if we have a config ID
      if (!config.id) return;

      console.log("Setting up real-time subscription for dreamvisitor_config");

      // Subscribe to real-time updates for this config
      const subscriptionPromise = pb.collection('dreamvisitor_config').subscribe(config.id, function (e) {
        console.log('Dreamvisitor config changed:', e);

        // Only update if we're not in the middle of saving operations
        if (!loading && e.action === 'update') {
          try {
            // Fetch the full record with expanded relations
            if (config.id) {
              pb.collection('dreamvisitor_config').getOne(config.id, {
                expand: 'hub_location'
              }).then(record => {
                const configData = convertRecord(record);

                // Check for unsaved changes by comparing strings directly
                const currentConfigStr = JSON.stringify(config);
                const originalConfigStr = JSON.stringify(originalConfig);
                const hasUnsavedChanges = currentConfigStr !== originalConfigStr;

                // If user has unsaved changes, don't overwrite but indicate changes exist
                if (hasUnsavedChanges) {
                  setExternalChanges(true);
                } else {
                  // Make sure we're not setting a null value for boolean properties
                  const safeConfigData = {
                    ...configData,
                    debug: configData.debug ?? false,
                    pauseChat: configData.pauseChat ?? false,
                    softWhitelist: configData.softWhitelist ?? false,
                    disablePvP: configData.disablePvP ?? false,
                    logConsole: configData.logConsole ?? false,
                    enableLogConsoleCommands: configData.enableLogConsoleCommands ?? true,
                    webWhitelistEnabled: configData.webWhitelistEnabled ?? true
                  };

                  setConfig(safeConfigData);
                  setOriginalConfig({ ...safeConfigData });
                  setLastUpdated(new Date());
                }
              });
            } else {
              console.error('Error: No Config is Loaded');
            }
          } catch (error) {
            console.error('Error handling real-time update:', error);
          }
        }
      });

      // Store the unsubscribe function for cleanup
      subscriptionPromise.then(func => {
        unsubscribe = func;
      }).catch(err => {
        console.error('Error setting up real-time subscription:', err);
      });
    } catch (err) {
      console.error('Error in subscription setup:', err);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        console.log("Cleaning up dreamvisitor_config subscription");
        unsubscribe();
      }
    };
  }, [config.id, loading, convertRecord, originalConfig]);

  const handleApply = useCallback(async () => {
    try {
      setLoading(true);
      setSaveError(null);

      const recordData = convertToRecord(config);

      // Handle hub location separately
      if (config.hubLocation) {
        // If we have a hub location, either update it or create a new one
        let locationId = '';

        try {
          if (config.id) {
            // Get the current config to check for existing hub_location
            const currentConfig = await pb.collection('dreamvisitor_config').getOne(config.id, {
              expand: 'hub_location'
            });

            if (currentConfig.hub_location) {
              // Update the existing location
              await pb.collection('location').update(currentConfig.hub_location, {
                x: config.hubLocation.x,
                y: config.hubLocation.y,
                z: config.hubLocation.z,
                pitch: config.hubLocation.pitch,
                yaw: config.hubLocation.yaw,
                world: config.hubLocation.world
              });
              locationId = currentConfig.hub_location;
            } else {
              // Create a new location
              const newLocation = await pb.collection('location').create({
                x: config.hubLocation.x,
                y: config.hubLocation.y,
                z: config.hubLocation.z,
                pitch: config.hubLocation.pitch,
                yaw: config.hubLocation.yaw,
                world: config.hubLocation.world
              });
              locationId = newLocation.id;
            }
          }
        } catch (error) {
          console.error('Failed to handle hub location:', error);
        }

        if (locationId) {
          recordData.hub_location = locationId;
        }
      }

      // Update or create the config record
      if (config.id) {
        await pb.collection('dreamvisitor_config').update(config.id, recordData);
      } else {
        // const record = await pb.collection('dreamvisitor_config').create(recordData);
        // setConfig(prev => ({ ...prev, id: record.id }));
        console.log("Error no config was fetched from the server")
      }

      setOriginalConfig({ ...config });
      setSaveSuccess(true);
      setExternalChanges(false); // Reset external changes flag
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to apply config:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  }, [config, convertToRecord]);

  const handleRevert = useCallback(() => {
    setConfig({ ...originalConfig });
    setExternalChanges(false); // Reset external changes flag
  }, [originalConfig]);

  // Function to refresh configuration from server
  const handleRefresh = useCallback(async () => {
    if (config.id) {
      try {
        setLoading(true);
        const record = await pb.collection('dreamvisitor_config').getOne(config.id, {
          expand: 'hub_location'
        });

        const configData = convertRecord(record);

        // Ensure boolean values are never null
        const safeConfigData = {
          ...configData,
          debug: configData.debug ?? false,
          pauseChat: configData.pauseChat ?? false,
          softWhitelist: configData.softWhitelist ?? false,
          disablePvP: configData.disablePvP ?? false,
          logConsole: configData.logConsole ?? false,
          enableLogConsoleCommands: configData.enableLogConsoleCommands ?? true,
          webWhitelistEnabled: configData.webWhitelistEnabled ?? true
        };

        setConfig(safeConfigData);
        setOriginalConfig({ ...safeConfigData });
        setExternalChanges(false); // Reset external changes flag
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to refresh config:', error);
        setFetchError(error instanceof Error ? error.message : 'Failed to refresh configuration');
      } finally {
        setLoading(false);
      }
    }
  }, [config.id, convertRecord]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(originalConfig);
  }, [config, originalConfig]);

  const renderLazyComponent = (Component: React.LazyExoticComponent<any>, props: any) => (
    <Suspense fallback={<Loader size="sm" />}>
      <Component {...props} />
    </Suspense>
  );

  return (
    <>
      <Space h={space} />
      <Title order={2}>Dreamvisitor Configuration</Title>
      <Text size="md">Configure Dreamvisitor.</Text>
      <Space h={space} />
      <Divider />
      <Space h={space} />

      {/* Relative position needed for the LoadingOverlay */}
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

        {/* Status alerts */}
        {fetchError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={() => setFetchError(null)} mb={space}>
            {fetchError}
          </Alert>
        )}

        {saveError && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={() => setSaveError(null)} mb={space}>
            {saveError}
          </Alert>
        )}

        {saveSuccess && (
          <Alert icon={<IconCheck size={16} />} title="Success" color="green" withCloseButton onClose={() => setSaveSuccess(false)} mb={space}>
            Configuration saved successfully!
          </Alert>
        )}

        {externalChanges && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="External Changes"
            color="yellow"
            withCloseButton
            onClose={() => setExternalChanges(false)}
            mb={space}
          >
            This configuration has been modified elsewhere.
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
              ml={8}
            >
              Refresh
            </Button>
          </Alert>
        )}

        <Group justify="space-between" mb={space}>
          {lastUpdated && (
            <Text size="sm" color="dimmed">
              Last updated: {lastUpdated.toLocaleString()}
            </Text>
          )}

          <Group gap="xs">
            {hasChanges && (
              <Badge color="yellow" variant="filled">Unsaved Changes</Badge>
            )}
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="subtle"
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        <BasicSettings config={config} setConfig={setConfig} space={space} />

        <Space h={space} />
        <MemoizedLocationInput
          label='Hub Location'
          location={config.hubLocation}
          onLocationChange={(loc) => setConfig(prev => ({ ...prev, hubLocation: loc }))}
        />

        <Space h={space} />
        <BotConfig config={config} setConfig={setConfig} space={space} />

        <Space h={space} />
        <Fieldset legend="Web Whitelist">
          <Checkbox
            label='Web Whitelist'
            description='Whether web whitelisting is enabled or not. This can be set with the /toggleweb Discord command. Enabled by default.'
            checked={config?.webWhitelistEnabled ?? true}
            onChange={(e) => {
              const { checked } = e.currentTarget;
              setConfig(prev => ({ ...prev, webWhitelistEnabled: checked }))
            }}
          />
          <Space h={space} />
          <TextInput
            label='Website URL'
            placeholder='https://woftnw.org'
            description='The URL for the whitelisting website. Used to restrict requests not from the specified website to prevent abuse.'
            value={config?.websiteUrl || ''}
            type='url'
            onChange={(e) => {
              const { value } = e.currentTarget;
              setConfig(prev => ({ ...prev, websiteUrl: value }))
            }}
          />
        </Fieldset>

        <Space h={space} />
        <Space h={space} />
        {renderLazyComponent(InfractionsFieldset, { config, setConfig, space })}
        <Space h={space} />
        {renderLazyComponent(EconomyFieldset, { config, setConfig, space })}
        <Space h={space} />
        {renderLazyComponent(MailFieldset, { config, setConfig, space })}
        <Space h={space} />
        <Divider />
        <Space h={space} />
        <Group>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleApply}
            loading={loading}
            disabled={!hasChanges}
          >
            Apply Changes
          </Button>
          <Button
            variant='light'
            onClick={handleRevert}
            disabled={loading || !hasChanges}
          >
            Revert Changes
          </Button>
        </Group>
      </div>
    </>
  );
}
