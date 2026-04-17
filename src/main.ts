import { ItemDisplayElement } from "./item_display";

const icon = "check_box_outline_blank"

BBPlugin.register('item-display', {
    title: 'Item display builder',
    author: 'Seggan',
    icon: icon,
    description: '',
    version: '1.0.0',
    variant: 'both',
    onload: onLoad
});

async function onLoad() {
    let displayModelFormat: ModelFormat = new ModelFormat("item_display_model", {
        id: "item_display_model",
        icon: icon,
        name: "Display Model",
        category: "minecraft",
        description: "Display Model for plugin developers of Minecraft Java Edition.",
        target: ["Minecraft: Java Edition (Plugins)", "Plugin Developers", "Minecraft Server Owners"],
        format_page: {
            component: {
                methods: {
                    create: () => displayModelFormat.new()
                },
                template: `
                <div style="display:flex;flex-direction:column;height:100%">
                    <p class="format_description">TODO</p>
                    <p class="format_target"><b>Target</b> : <span>Minecraft: Java Edition (Plugins)</span> <span>Plugin Developers</span> <span>Server Owners</span></p>
                    <content>
                        <h3 class="markdown">Good to know:</h3>
                        <p class="markdown">
                            <ul>
                                <li>You need an internet connection to use this, its required to fetch the models and textures necessary to function!</li>
                                <li>This format is designed to turn cuboid models into code loadable using TODO</li>
                                <li>A cuboid with a size of 1, 1, 1 is the size of the default minecraft block</li>
                                <li>You can change a cuboids material by right clicking and selecting change material!</li>
                            </ul>
                        </p>
                    </content>
                    <div class="spacer"></div>
                    <div class="button_bar">
                        <button id="create_new_model_button" style="margin-top:20px;margin-bottom:24px;" @click="create">
                            <i class="material-icons">${icon}</i>
                            Create New Display Model
                        </button>
                    </div>
                </div>
                `
            }
        },
        model_identifier: false,
        rotate_cubes: true,
        uv_rotation: false,
        bone_rig: true,
        centered_grid: true,
        edit_mode: true,
        paint_mode: false,
        animation_mode: false,
        pose_mode: false
    });

    const displayModelFormatCondition: ConditionResolvable = {
        formats: [displayModelFormat.id]
    }

    let add_action = new Action('add_item_display', {
        name: 'Add Item Display',
        icon: 'align_flex_end',
        category: 'edit',
        condition: displayModelFormatCondition,
        click() {

            Undo.initEdit({ outliner: true, elements: [], selection: true });
            const display = new ItemDisplayElement({}).init();

            const group = getCurrentGroup();
            display.addTo(group);

            unselectAllElements();
            display.select();
            Undo.finishEdit('Add Item Display', { outliner: true, elements: Outliner.selected, selection: true });

            return display;
        }
    });
    Interface.Panels.outliner.menu.addAction(add_action, 'add_element');
}