import { Accordion, Badge, Group } from '@mantine/core';

const groceries = [
    {
        date: '01/01/2001',
        value: 1,
        reason:
            'Crisp and refreshing fruit. Apples are known for their versatility and nutritional benefits. They come in a variety of flavors and are great for snacking, baking, or adding to salads.',
        expired: true
    },
    {
        date: '02/02/2002',
        value: 0,
        reason:
            'Naturally sweet and potassium-rich fruit. Bananas are a popular choice for their energy-boosting properties and can be enjoyed as a quick snack, added to smoothies, or used in baking.',
        expired: true
    },
    {
        date: '03/30/2035',
        value: 2,
        reason:
            'Nutrient-packed green vegetable. Broccoli is packed with vitamins, minerals, and fiber. It has a distinct flavor and can be enjoyed steamed, roasted, or added to stir-fries.',
        expired: false
    },
];

export function InfractionList() {
    function badge(expired: boolean) {
        if (expired) {
            return <Badge variant='light'>Expired</Badge>
        }
    }

    // See groceries data above
    const items = groceries.map((item) => (
        <Accordion.Item value={item.date}>
            <Accordion.Control>
                <Group>
                    {item.date}
                    {badge(item.expired)}
                </Group>
            </Accordion.Control>
            <Accordion.Panel>{item.reason}</Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <Accordion variant="contained">
            {items}
        </Accordion>
    );
}