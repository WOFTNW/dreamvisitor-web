import { pb } from '@/lib/pocketbase';

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase());
}

/**
 * Format server properties object to Minecraft server.properties format
 */
export function formatServerProperties(props: Record<string, any>): string {
  const timestamp = new Date().toString();
  let result = `#Minecraft server properties\n#[${timestamp}]\n`;

  // Process each property
  for (const [key, value] of Object.entries(props)) {
    // Skip internal react state properties
    if (key === 'rconPassword') {
      result += `rcon.password=${value}\n`;
      continue;
    }
    if (key === 'rconPort') {
      result += `rcon.port=${value}\n`;
      continue;
    }
    if (key === 'queryPort') {
      result += `query.port=${value}\n`;
      continue;
    }
    if (key === 'serverPort') {
      result += `server-port=${value}\n`;
      continue;
    }
    if (key === 'serverIp') {
      result += `server-ip=${value}\n`;
      continue;
    }

    // Convert camelCase to kebab-case for standard Minecraft property names
    const propName = camelToKebab(key);

    // Format boolean values as 'true' or 'false' strings
    const propValue = typeof value === 'boolean' ? value.toString() : value;

    result += `${propName}=${propValue}\n`;
  }

  return result;
}

/**
 * Parse server.properties content into a JavaScript object
 */
export function parseServerProperties(content: string): Record<string, any> {
  const properties: Record<string, any> = {};

  // Split by lines and process each line
  const lines = content.split('\n');

  lines.forEach(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) return;

    // Split by first equals sign
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) return;

    const key = line.substring(0, separatorIndex).trim();
    const value = line.substring(separatorIndex + 1).trim();

    // Handle special properties with dots
    if (key === 'rcon.password') {
      properties.rconPassword = value;
      return;
    }
    if (key === 'rcon.port') {
      properties.rconPort = parseInt(value, 10) || 25575;
      return;
    }
    if (key === 'query.port') {
      properties.queryPort = parseInt(value, 10) || 25565;
      return;
    }
    if (key === 'server-port') {
      properties.serverPort = parseInt(value, 10) || 25565;
      return;
    }
    if (key === 'server-ip') {
      properties.serverIp = value;
      return;
    }

    // Convert kebab-case to camelCase
    const camelKey = kebabToCamel(key);

    // Convert values to appropriate types
    if (value === 'true') {
      properties[camelKey] = true;
    } else if (value === 'false') {
      properties[camelKey] = false;
    } else if (/^-?\d+$/.test(value)) {
      // If it's an integer
      properties[camelKey] = parseInt(value, 10);
    } else if (/^-?\d+\.\d+$/.test(value)) {
      // If it's a float
      properties[camelKey] = parseFloat(value);
    } else {
      // Otherwise, keep as string
      properties[camelKey] = value;
    }
  });

  return properties;
}

/**
 * Fetch the current server.properties from PocketBase
 */
export async function fetchServerProperties(): Promise<Record<string, any>> {
  try {
    // Get the server config record
    const configs = await pb.collection('server_config').getFullList({ limit: 1 });

    if (configs.length === 0) {
      console.log('No server config found');
      return {};
    }

    const config = configs[0];

    // Get the file URL
    if (!config.server_properties) {
      console.log('No server.properties file found');
      return {};
    }

    // Get the full URL to the file
    const fileUrl = pb.files.getURL(config, config.server_properties);


    // Fetch the file content
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch server properties: ${response.statusText}`);
    }

    const content = await response.text();

    // Parse the file content
    return parseServerProperties(content);
  } catch (error) {
    console.error('Error fetching server properties:', error);
    throw error;
  }
}

/**
 * Export server properties to file and upload to PocketBase
 */
export async function exportServerProperties(serverProps: Record<string, any>): Promise<void> {
  try {
    // Format properties
    const formattedProps = formatServerProperties(serverProps);

    // Create file object
    const file = new File([formattedProps], 'server.properties', {
      type: 'text/plain',
    });

    // Create form data for upload
    const formData = new FormData();
    formData.append('server_properties', file);

    // Check if config exists and update or create
    try {
      const configs = await pb.collection('server_config').getFullList({ limit: 1 });

      if (configs.length > 0) {
        // Update existing record
        await pb.collection('server_config').update(configs[0].id, formData);
        console.log('Server properties updated successfully');
        return;
      }
    } catch (err) {
      // No existing record or error fetching
      console.log('No existing server config found, creating new one');
    }

    // Create new record
    await pb.collection('server_config').create(formData);
    console.log('Server properties created successfully');

  } catch (error) {
    console.error('Error exporting server properties:', error);
    throw error;
  }
}

/**
 * Subscribe to server_config changes and provide callback
 */
export function subscribeToServerConfigChanges(callback: (data: any) => void): () => void {
  let unsubscribeFunc: (() => void) | null = null;

  try {
    const unsubscribePromise = pb.collection('server_config').subscribe('*', (data) => {
      callback(data);
    });

    // Store the unsubscribe function when promise resolves
    unsubscribePromise.then(func => {
      unsubscribeFunc = func;
    });

    return () => {
      try {
        if (unsubscribeFunc) {
          unsubscribeFunc();
        }
      } catch (error) {
        console.error('Error unsubscribing from server config changes:', error);
      }
    };
  } catch (error) {
    console.error('Error subscribing to server config changes:', error);
    return () => { }; // Return a no-op function if subscription fails
  }
}
