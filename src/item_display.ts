export class ItemDisplayElement extends OutlinerElement {

    constructor(data: any, uuid = guid()) {
        super(data, uuid);

        for (const key in ItemDisplayElement.properties) {
            ItemDisplayElement.properties[key].reset(this);
        }

        this.name = "Item Display";

        if (data && data instanceof Object) {
            this.extend(data);
        }
    }

    extend(data: any) {
        for (const key in ItemDisplayElement.properties) {
            ItemDisplayElement.properties[key].merge(this, data);
        }
        this.sanitizeName();
    }
}

new Property(ItemDisplayElement, "string", "material", {
    default: "stone",
    exposed: true,
});

OutlinerElement.registerType(ItemDisplayElement, "item_display");

new NodePreviewController(ItemDisplayElement, {
    setup(element: ItemDisplayElement) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));

    },
});