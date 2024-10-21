import { useRef, useState } from 'react';
import { Combobox, InputBase, Loader, useCombobox } from '@mantine/core';

const MOCKDATA = [
    'Sapphire',
    'On Break',
    'Admin',
    'Trial Admin',
    'Moderator',
    'Trial Mod',
    'Helper',
    'Bots',
    'Patreon',
    'Server Booster',
    'Patron',
    'Admin-Designated Purple Heart',
    'Tribe Ruler',
    'I Spent 1M Scales And All I Got Was This Lousy Role',
    'HiveWing',
    'IceWing',
    'LeafWing',
    'MudWing',
    'NightWing',
    'RainWing',
    'SandWing',
    'SeaWing',
    'SilkWing',
    'SkyWing',
    'Hybrid-Sky',
    'Hybrid-Mud',
    'Hybrid-Hive',
    'Hybrid-Sand',
    'Hybrid-Leaf',
    'Hybrid-Rain',
    'Hybrid-Ice',
    'Hybrid-Sea',
    'Hybrid-Night',
    'Hybrid-Silk',
    'SB',
    'Issues Talk',
    'Tupperbox',
    'PluralKit',
    'Dreamvisitor',
    'Tickets',
    'Chip',
    'He/Him',
    'She/Her',
    'They/Them',
    'It/Its',
    'Any Pronouns',
    'Ask Pronouns',
    'Neopronouns',
    'Java',
    'Bedrock',
    'EoF Developer',
    'MC Server Icon Artist',
    'Server Banner Maker',
    'Invite Banner Maker',
    'Discord Icon Artist',
    'Emote Maker',
    'Alt',
    '🔔 Announcements',
    '🔔 Events',
    '🔔 Updates',
    '🔔 Server-Up',
    'Insider (Level 3)',
    'Insider (Level 2)',
    'Insider (Level 1)',
    'RB',
    'Starboard',
    'Statbot',
    'Festie',
    'Wiki-Bot',
    'Wiki Verified',
    'Oak Boat.'
];

function getAsyncData(searchQuery: string, signal: AbortSignal) {
    return new Promise<string[]>((resolve, reject) => {
        signal.addEventListener('abort', () => {
            reject(new Error('Request aborted'));
        });

        setTimeout(() => {
            resolve(
                MOCKDATA.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase())).slice(
                    0,
                    5
                )
            );
        }, Math.random() * 1000);
    });
}

export function SelectRole({ ...props }) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<string[] | null>(null);
    const [value, setValue] = useState('');
    const [empty, setEmpty] = useState(false);
    const abortController = useRef<AbortController>();

    const fetchOptions = (query: string) => {
        abortController.current?.abort();
        abortController.current = new AbortController();
        setLoading(true);

        getAsyncData(query, abortController.current.signal)
            .then((result) => {
                setData(result);
                setLoading(false);
                setEmpty(result.length === 0);
                abortController.current = undefined;
            })
            .catch(() => { });
    };

    const options = (data || []).map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    return (
        <Combobox
            onOptionSubmit={(optionValue) => {
                setValue(optionValue);
                combobox.closeDropdown();
            }}
            withinPortal={false}
            store={combobox}
        >
            <Combobox.Target>
                <InputBase
                    label={props.label}
                    description={props.description}
                    value={value}
                    onChange={(event) => {
                        setValue(event.currentTarget.value);
                        fetchOptions(event.currentTarget.value);
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => {
                        combobox.openDropdown();
                        if (data === null) {
                            fetchOptions(value);
                        }
                    }}
                    onBlur={() => combobox.closeDropdown()}
                    rightSection={loading && <Loader size={18} />}
                    placeholder="Search role"
                    rightSectionPointerEvents="none"
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
                    {options} {empty && <Combobox.Empty>No results found</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}