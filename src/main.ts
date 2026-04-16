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
    let display_model_format = new ModelFormat("item_display_model", {
        icon: icon,
        name: "Display Model",
        category: "minecraft",
        description: "Display Model for plugin developers of Minecraft Java Edition.",
        target: ["Minecraft: Java Edition (Plugins)", "Plugin Developers", "Minecraft Server Owners"],
        format_page: {
            component: {
                methods: { 
                    create: () => display_model_format.new()
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
        pose_mode: false,
        new() {
            newProject(display_model_format);
            Project.texture_width = 16;
            Project.texture_height = 16;
            return true;
        }
    });
}