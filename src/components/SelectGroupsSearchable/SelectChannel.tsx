import { useState } from 'react';
import { Combobox, InputBase, Loader, useCombobox } from '@mantine/core';

const MOCKDATA = [
    '🍎 Apples',
    '🍌 Bananas',
    '🥦 Broccoli',
    '🥕 Carrots',
    '🍫 Chocolate',
    '🍇 Grapes',
];

function getAsyncData() {
    return new Promise<string[]>((resolve) => {
        setTimeout(() => resolve(MOCKDATA), 2000);
    });
}

const channels = [
    { label: '👋 Landing Ground 👋', options: ['# new-folk', '# whitelist'] },
    { label: '📰 Server Info 📰', options: ['# rules', '# announcements', '# polls', '# poll-discussion', '# about-staff', 'woftnw-socials'] },
    { label: '🔎 Help Desk 🔎', options: ['# faq', '# questions', '# bug-report', '# health-resources', '# ticket'] },
    { label: '💬 Chat Rooms 💬', options: ['# general', '# art-and-discussion', '# community-polls', '# community-polls-discussion', '# pictures', '# other-media', '# animals', '# trading-and-sales', '# books-discussion', '# celebratory-channel'] },
    { label: '🎙️ Voice Channels 🎙️', options: ['# no-mic-chat', '# vc-commands'] },
    { label: '🧳 Miscellaneous 🧳', options: ['# random-woftnw-quotes', '# starboard', '# infodumping', '# self-introduction', '# oc-discussion', '# advertisements', '# bot-commands'] },
    { label: '🏅 Server Supporters 🏅', options: ['# insiders-level-one', '# insiders-level-one', '# insiders-level-three', '# patron-chat'] },
    { label: '🛡️ The Staff Stage 🛡️', options: ['# moderation-commands', '# in-game-log', '# log'] },
    { label: '🎙️ Staff VCs 🎙️', options: ['# admin-no-mic-chat', '# staff-no-mic-chat'] },

];

const allGroceries = channels.reduce<string[]>((acc, group) => [...acc, ...group.options], []);

export function SelectChannel({...props}) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
        onDropdownOpen: () => {
            if (data.length === 0 && !loading) {
              setLoading(true);
              getAsyncData().then((response) => {
                setData(response);
                setLoading(false);
                combobox.resetSelectedOption();
              });
            }
          },
    });

    const [value, setValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<string[]>([]); 
    const [search, setSearch] = useState('');

    const shouldFilterOptions = allGroceries.every((item) => item !== search);
    const filteredGroups = channels.map((group) => {
        const filteredOptions = shouldFilterOptions
            ? group.options.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
            : group.options;

        return { ...group, options: filteredOptions };
    });

    const totalOptions = filteredGroups.reduce((acc, group) => acc + group.options.length, 0);

    const groups = filteredGroups.map((group) => {
        const options = group.options.map((item) => (
            <Combobox.Option value={item} key={item}>
                {item}
            </Combobox.Option>
        ));

        return (
            <Combobox.Group label={group.label} key={group.label}>
                {options}
            </Combobox.Group>
        );
    });

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                setValue(val);
                setSearch(val);
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    label={props.label}
                    description={props.description}
                    rightSection={loading && <Loader size={18} />}
                    value={search}
                    onChange={(event) => {
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                        setSearch(event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => {
                        combobox.closeDropdown();
                        setSearch(value || '');
                    }}
                    placeholder="Search channel"
                    rightSectionPointerEvents="none"
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
                    {loading ? <Combobox.Empty>Loading....</Combobox.Empty> : totalOptions > 0 ? groups : <Combobox.Empty>Nothing found</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}