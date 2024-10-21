import { ActionIcon, Divider, Stack, TextInput } from '@mantine/core';
import {
    IconArrowDown,
    IconSend,
} from '@tabler/icons-react';
import classes from './InteractiveConsole.module.css';
import { useRef } from 'react';

var data = [
    '[17:03:28 INFO]: ratttatoullie joined the game',
    '[17:03:28 INFO]: ratttatoullie[/38.186.113.107:64057] logged in with entity id 164093 at ([world]14.092836983169923, 66.0, 63.58624276545464)',
    '[17:03:44 INFO]: <ratttatoullie> man....',
    '[17:35:56 INFO]: ratttatoullie lost connection: Disconnected',
    '[17:35:56 INFO]: ratttatoullie left the game',
    '[17:36:13 INFO]: UUID of player ratttatoullie is f40bdf3d-ed8c-4dd3-9bc4-56f1022c33b0',
    '[17:36:15 INFO]: ratttatoullie joined the game',
    '[17:36:15 INFO]: ratttatoullie[/38.186.113.107:64680] logged in with entity id 169226 at ([world]-265.8491524468691, 68.0, -58.30000001192093)',
    '[17:41:49 INFO]: ratttatoullie lost connection: Disconnected',
    '[17:41:49 INFO]: ratttatoullie left the game',
    '[17:42:02 INFO]: UUID of player ratttatoullie is f40bdf3d-ed8c-4dd3-9bc4-56f1022c33b0',
    '[17:42:03 INFO]: ratttatoullie joined the game',
    '[17:42:03 INFO]: ratttatoullie[/38.186.113.107:64781] logged in with entity id 170164 at ([world]-238.30000001192093, 72.0, -120.73807112314138)',
    '[18:34:49 INFO]: ratttatoullie issued server command: /abilities',
    '[18:34:51 INFO]: ratttatoullie issued server command: /abilities 0 1',
    '[18:35:09 INFO]: ratttatoullie issued server command: /abilities',
    '[18:35:10 INFO]: ratttatoullie issued server command: /abilities 0 0',
    '[19:02:18 INFO]: ratttatoullie lost connection: Disconnected',
    '[19:02:19 INFO]: ratttatoullie left the game',
    '[21:21:14 INFO]: UUID of player ratttatoullie is f40bdf3d-ed8c-4dd3-9bc4-56f1022c33b0',
    '[21:21:15 INFO]: ratttatoullie joined the game',
    '[21:21:15 INFO]: ratttatoullie[/38.186.113.107:50950] logged in with entity id 191385 at ([world]-66.74517836649711, 98.0, 81.0108063208654)',
    '[21:36:21 INFO]: ratttatoullie has made the advancement [The Parrots and the Bats]',
    '[22:39:02 INFO]: ratttatoullie has made the advancement [Hot Stuff]',
    '[22:53:35 INFO]: UUID of player _SilverRain is 0d005102-db98-494c-8a2a-029f7810eb67',
    '[22:53:37 INFO]: _SilverRain joined the game',
    '[22:53:37 INFO]: _SilverRain[/208.84.223.103:59802] logged in with entity id 203931 at ([world]-442.87814040626444, 65.0, 139.25889704148938)',
    '[22:58:55 INFO]: _SilverRain has made the advancement [The Cutest Predator]',
    '[23:02:53 INFO]: _SilverRain lost connection: Disconnected',
    '[23:02:53 INFO]: _SilverRain left the game',
    '[00:14:11 INFO]: ratttatoullie has made the advancement [The Cutest Predator]',
    '[00:43:42 INFO]: ratttatoullie lost connection: Disconnected',
    '[00:43:42 INFO]: ratttatoullie left the game'
];

export function InteractiveConsole() {

    const lines = data.map((item) => (
        <code className={classes.line}>{item}</code>
    ));

    const viewport = useRef<HTMLDivElement>(null);

    const scrollToBottom = () =>
        viewport.current!.scrollTo({ top: viewport.current!.scrollHeight, behavior: 'smooth' });

    return (
        <Stack className={classes.container}>
            <div className={classes.feedContainer}>
                <Stack className={classes.feed} justify="left" gap={"0px"} ref={viewport}>
                    {lines}
                </Stack>
                <ActionIcon title='Jump to bottom' onClick={scrollToBottom} variant='white' size={'xl'} className={classes.jump}>
                    <IconArrowDown className='classes.icon' stroke={1.5} />
                </ActionIcon>
            </div>
            <Divider></Divider>
            <div className={classes.sender}>
                <TextInput className={classes.input}
                    variant="unstyled"
                    placeholder="Command"
                />
                <ActionIcon title='Send' size={'xl'}>
                    <IconSend className='classes.icon' stroke={1.5} />
                </ActionIcon>

            </div>
        </Stack>
    );
}