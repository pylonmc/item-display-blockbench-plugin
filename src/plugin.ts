import { generateCode } from "./codegen";
import { TextureManager } from "./texture_manager";

declare global {
    interface Cube {
        material: string;
    }
    interface Window {
        TextureManager: TextureManager;
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

let modelCodePanel: Panel;

async function onLoad() {
    const manager = new TextureManager();
    unloadTasks.push(() => manager.clearCache());
    window.TextureManager = manager;
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
        return options;
    }

    const changeMaterialDialog = new Dialog({
        title: "Change Material",
        id: "material_dialog",
        form: {
            material: {label: "Material", type: "inline_select", options: generateDialogOptions()}
        },
        async onConfirm(form_data) {
            for (const cube of Cube.selected) {
                cube.material = form_data.material;
                await manager.updateCubeMaterial(cube);
            }
        }
    });
    unloadTasks.push(() => changeMaterialDialog.delete());

    const changeMaterialAction = new Action("change_cube_material", {
        name: "Change Material",
        description: "Change the material of the cube, this is used for the generated item display!",
        icon: icon,
        condition: displayModelFormatCondition,
        click() {
            changeMaterialDialog.show();
        }
    });
    unloadTasks.push(() => changeMaterialAction.delete());

    Cube.prototype.menu?.addAction(changeMaterialAction);

    const finishedEdit = () => {
        manager.cleanupTextures();
        if (Project?.format.id !== displayModelFormat.id) return;
        const code = generateCode(Project!.elements.filter(e => e instanceof Cube) as Cube[]);
        (modelCodePanel.vue as any).text = code;
    }
    Blockbench.on<EventName>("finished_edit", finishedEdit);
    unloadTasks.push(() => Blockbench.removeListener<EventName>("finished_edit", finishedEdit));

    const addCube = async () => {
        const cube = Cube.selected[0];
        cube.from = [-0.5, -0.5, -0.5];
        cube.to = [0.5, 0.5, 0.5];
        cube.origin = [0, 0, 0];
        cube.material = "stone";
        cube.transferOrigin(cube.origin); // update cube visual
        await manager.updateCubeMaterial(cube);
        finishedEdit();
    };

    Blockbench.on<EventName>("add_cube", addCube);
    unloadTasks.push(() => Blockbench.removeListener<EventName>("add_cube", addCube));

    const copyModelCodeAction = new Action("copy_model_code", {
        name: "Copy Model Code",
        description: "Copy the display model code to the clipboard",
        icon: "content_copy",
        click() {
            Blockbench.showQuickMessage("Copied model code to clipboard!");
            finishedEdit();
            navigator.clipboard.writeText((modelCodePanel.vue as any).text);
        }
    });
    unloadTasks.push(() => copyModelCodeAction.delete());

    const modelCodeToolbar = new Toolbar("model_code_toolbar", {
        id: "model_code_toolbar",
        condition: displayModelFormatCondition,
        children: [copyModelCodeAction]
    });

    modelCodePanel = new Panel("display_model_code_panel", {
        id: "display_model_code_panel",
        expand_button: true,
        default_side: "right",
        name: "Model Code",
        icon: "code",
        growable: true,
        condition: displayModelFormatCondition,
        toolbars: [modelCodeToolbar],
        component: {
            components: {
                VuePrismEditor
            },
            data: {
                text: `// There is nothing to display!
// Try adding some cubes to get started!`,
                yml: false,
                scale_factor: false
            },
            template: `
                <div>
                    <vue-prism-editor v-model="text" language="java" readonly=true line-numbers />
                </div>
            `
        }
    });
    unloadTasks.push(() => modelCodePanel.delete());
}