import items from './items.json';

items.sort();

BBPlugin.register('item-display', {
    title: 'Item display builder',
    author: 'Seggan',
    icon: '',
    description: '',
    version: '1.0.0',
    variant: 'both',
    onload() {
    }
});