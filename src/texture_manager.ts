const textureFixMap: Map<Face, Face> = new Map([
    ["north", "south"],
    ["south", "north"],
    ["east", "west"],
    ["west", "east"]
]);

export class TextureManager {
    private readonly items: Map<string, string> = new Map();
    private readonly models: Map<string, Map<Face, string>> = new Map();
    private readonly textures: Map<string, Texture> = new Map();

    private cleaningUp = false;

    async loadItems() {
        const items = await fetch("https://raw.githubusercontent.com/pylonmc/item-display-bbp-data/refs/heads/master/data/items.json").then(res => res.json());
        for (const [key, value] of Object.entries(items)) {
            this.items.set(key, value as string);
        }
    }

    getItems(): string[] {
        return Array.from(this.items.keys()).sort();
    }

    private async getModel(material: string): Promise<Map<Face, string>> {
        if (!this.items.has(material)) {
            console.warn(`Material ${material} not found, defaulting to stone`);
            material = "stone";
        }

        if (this.models.has(material)) {
            return this.models.get(material)!;
        }

        const modelName = this.items.get(material)!;
        const rawModel = await fetch(`https://raw.githubusercontent.com/pylonmc/item-display-bbp-data/refs/heads/master/data/models/${modelName}.json`).then(res => res.json());
        const model: Map<Face, string> = new Map();
        for (const [face, texture] of Object.entries(rawModel)) {
            model.set(face as Face, texture as string);
        }
        this.models.set(material, model);
        return model;
    }

    private async getTexture(textureName: string): Promise<Texture> {
        if (this.textures.has(textureName)) {
            return this.textures.get(textureName)!;
        }

        const url = `https://raw.githubusercontent.com/pylonmc/item-display-bbp-data/refs/heads/master/data/textures/${textureName}.png`;
        const dataUrl = await urlToDataUrl(url);
        const texture = new Texture({name: textureName}).fromDataURL(dataUrl).add();
        this.textures.set(textureName, texture);
        return texture;
    }

    async updateCubeMaterial(cube: Cube) {
        let material = cube.material;
        if (!this.items.has(material)) {
            console.warn(`Material ${material} not found, defaulting to stone`);
            material = "stone";
        }

        const model = await this.getModel(material);
        cube.autouv = 0;
        for (const [face, textureName] of model.entries()) {
            const texture = await this.getTexture(textureName);
            const fixedFace = textureFixMap.get(face) ?? face;
            cube.applyTexture(texture, [fixedFace]);
            const cubeFace = cube.faces[fixedFace];
            if (cubeFace) {
                cubeFace.uv = [0, 0, 16, 16];
            }
            Canvas.updateUV(cube);
        }
        this.cleanupTextures();
    }

    cleanupTextures() {
        if (this.cleaningUp) return;
        this.cleaningUp = true;
        const usedTextures = new Set<string>();
        for (const cube of Cube.all) {
            const material = cube.material;
            if (!this.items.has(material)) continue;
            const model = this.models.get(material);
            if (!model) continue;
            for (const textureName of model.values()) {
                usedTextures.add(textureName);
            }
        }

        for (const [textureName, texture] of this.textures.entries()) {
            if (!usedTextures.has(textureName)) {
                texture.remove();
                this.textures.delete(textureName);
            }
        }
        this.cleaningUp = false;
    }

    clearCache() {
        this.models.clear();
        this.cleanupTextures();
        this.textures.clear();
    }
}

async function urlToDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

type Face = "up" | "down" | "north" | "south" | "east" | "west";