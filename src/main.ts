import { TextureManager } from "./texture_manager";

declare global {
    interface Cube {
        material: string;
    }
    interface Window {
        manager: TextureManager;
    }
}

const icon = "check_box_outline_blank"

const unloadTasks: (() => void)[] = [];

BBPlugin.register('item-display', {
    title: 'Item display builder',
    author: 'Seggan',
    icon: icon,
    description: '',
    version: '1.0.0',
    variant: 'both',
    onload: onLoad,
    onunload() {
        for (const task of unloadTasks) {
            task();
        }
    }
});

async function onLoad() {
    const manager = new TextureManager();
    unloadTasks.push(() => manager.clearCache());
    window.manager = manager;
    await manager.loadItems();

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
    };

    new Property(Cube, "string", "material", {
        default: "stone",
        exposed: true,
        condition: displayModelFormatCondition,
    });

    function generateDialogOptions(): {[key: string]: string} {
        const options: {[key: string]: string} = {};
        for (const item of manager.getItems()) {
            let name = "";
            for (const part of item.split("_")) {
                name += part.charAt(0).toUpperCase() + part.slice(1) + " ";
            }
            options[item] = name.trimEnd();
        }
        console.log(options);
        return options;
    }

    const change_material_dialog = new Dialog({
        title: "Change Material",
        id: "material_dialog",
        form: {
            material: {label: "Material", type: "select", options: generateDialogOptions()}
        },
        async onConfirm(form_data) {
            for (const cube of Cube.selected) {
                cube.material = form_data.material;
                await manager.updateCubeMaterial(cube);
            }
        }
    });

    const change_material_action = new Action("change_cube_material", {
        name: "Change Material",
        description: "Change the material of the cube, this is used for the generated item display!",
        icon: icon,
        condition: displayModelFormatCondition,
        click() {
            change_material_dialog.show();
        }
    });

    Cube.prototype.menu?.addAction(change_material_action);
    unloadTasks.push(() => change_material_action.delete());

    const updateCube = async () => {
        const cube = Cube.selected[0];
        // cube.resize(-1, 0, false);
        // cube.resize(-1, 1, false);
        // cube.resize(-1, 2, false);
        cube.from = [-0.5, -0.5, -0.5];
        cube.to = [0.5, 0.5, 0.5];
        cube.origin = [0, 0, 0];
        cube.material = "stone";
        cube.transferOrigin([0, 0, 0]); // update cube visual
        await manager.updateCubeMaterial(cube);
    };

    Blockbench.on<EventName>("add_cube", updateCube);
    unloadTasks.push(() => Blockbench.removeListener<EventName>("add_cube", updateCube));

    const cleanup = () => manager.cleanupTextures();
    Blockbench.on<EventName>("finished_edit", cleanup);
    unloadTasks.push(() => Blockbench.removeListener<EventName>("finished_edit", cleanup));
}