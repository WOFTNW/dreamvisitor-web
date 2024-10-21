
import { useRef, useState } from 'react';
import { Combobox, InputBase, Loader, useCombobox } from '@mantine/core';

const MOCKDATA = [
    '👋 Landing Ground 👋',
    '📰 Server Info 📰',
    '🔎 Help Desk 🔎',
    '💬 Chat Rooms 💬',
    '🎙️ Voice Channels 🎙️',
    '🧳 Miscellaneous 🧳',
    '🏅 Server Supporters 🏅',
    '🛡️ The Staff Stage 🛡️',
    '🎙️ Staff VCs 🎙️'
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

export function SelectCategory({ ...props }) {
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
                    placeholder="Search category"
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