import { useEffect, useState } from "react";
import { Fieldset, Grid, NumberInput, TextInput } from "@mantine/core";

// Define the Location interface
interface Location {
  x: number | null;
  y: number | null;
  z: number | null;
  pitch: number | null;
  yaw: number | null;
  world: string | null;
}

interface LocationInputProps {
  label: React.ReactNode;
  location?: Location | null;
  onLocationChange?: (location: Location) => void;
}

export function LocationInput({ label, location, onLocationChange }: LocationInputProps) {
  const [localLocation, setLocalLocation] = useState<Location>({
    x: null,
    y: null,
    z: null,
    pitch: null,
    yaw: null,
    world: null
  });

  // Initialize with provided location if available
  useEffect(() => {
    if (location) {
      setLocalLocation(location);
    }
  }, [location]);

  // Handle updating a specific field in the location
  const handleFieldUpdate = (field: keyof Location, value: any) => {
    const updatedLocation = {
      ...localLocation,
      [field]: value
    };

    setLocalLocation(updatedLocation);

    // Call the parent's onChange handler if provided
    if (onLocationChange) {
      onLocationChange(updatedLocation);
    }
  };

  return (
    <Fieldset legend={label}>
      <Grid grow>
        <Grid.Col span={4}>
          <NumberInput
            label='X'
            withAsterisk={true}
            value={localLocation.x ?? 0}
            onChange={(val) => handleFieldUpdate('x', val)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label='Y'
            withAsterisk={true}
            value={localLocation.y ?? 0}
            onChange={(val) => handleFieldUpdate('y', val)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label='Z'
            withAsterisk={true}
            value={localLocation.z ?? 0}
            onChange={(val) => handleFieldUpdate('z', val)}
          />
        </Grid.Col>
      </Grid>
      <Grid grow>
        <Grid.Col span={4}>
          <NumberInput
            label='Pitch'
            value={localLocation.pitch ?? 0}
            onChange={(val) => handleFieldUpdate('pitch', val)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label='Yaw'
            value={localLocation.yaw ?? 0}
            onChange={(val) => handleFieldUpdate('yaw', val)}
          />
        </Grid.Col>
      </Grid>
      <TextInput
        label='World'
        value={localLocation.world || ''}
        onChange={(e) => handleFieldUpdate('world', e.currentTarget.value)}
      />
    </Fieldset>
  );
}
