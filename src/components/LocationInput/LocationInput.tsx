import { Fieldset, Grid, NumberInput, TextInput } from "@mantine/core";

export function LocationInput({ label } : { label: React.ReactNode }) {
    return (<Fieldset legend={label}>
        <Grid grow>
            <Grid.Col span={4}>
                <NumberInput label='X' withAsterisk={true}></NumberInput>
            </Grid.Col>
            <Grid.Col span={4}>
                <NumberInput label='Y' withAsterisk={true}></NumberInput>
            </Grid.Col>
            <Grid.Col span={4}>
                <NumberInput label='Z' withAsterisk={true}></NumberInput>
            </Grid.Col>
        </Grid>
        <Grid grow>
            <Grid.Col span={4}>
                <NumberInput label='Pitch'></NumberInput>
            </Grid.Col>
            <Grid.Col span={4}>
                <NumberInput label='Yaw'></NumberInput>
            </Grid.Col>
        </Grid>
        <TextInput label='World'></TextInput>
        
    </Fieldset>)
}