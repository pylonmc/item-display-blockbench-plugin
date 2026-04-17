export function generateCode(cubes: Cube[]): string {
    if (cubes.length === 0) {
        return `// There is nothing to display!
// Try adding some cubes to get started!`;
    }
    const seenIds = new Set<string>();
    for (const cube of cubes) {
        if (seenIds.has(cube.name)) {
            return `// Error: Duplicate cube name "${cube.name}" found. Cube names must be unique.`;
        } else {
            seenIds.add(cube.name);
        }
    }

    let code = "";
    for (const cube of cubes) {
        code += generateForCube(cube) + "\n\n";
    }
    return code.trim();
}

function generateForCube(cube: Cube): string {
    const size = cube.to.map((coord, index) => coord - cube.from[index]);
    const location = cube.from.map((coord, index) => coord + size[index] / 2);
    const pivotOffset = cube.origin.map((coord, index) => coord - location[index]);
    return `
addEntity("${cube.name}", new ItemDisplayBuilder()
    .itemStack(ItemStackBuilder.of(Registry.MATERIAL.getOrThrow(NamespacedKey.minecraft("${cube.material}")))
        .addCustomModelDataString(getKey() + ":${cube.name}"))
    .transformation(new Matrix4f()
        .scaleLocal(${size[0]}F, ${size[1]}F, ${size[2]}F)
        .translateLocal(-${pivotOffset[0]}F, -${pivotOffset[1]}F, -${pivotOffset[2]}F)
        .rotateLocalX(${degreesToRadians(cube.rotation[0])}F)
        .rotateLocalY(${degreesToRadians(cube.rotation[1])}F)
        .rotateLocalZ(${degreesToRadians(cube.rotation[2])}F)
        .translateLocal(${location[0] + pivotOffset[0]}F, ${location[1] + pivotOffset[1]}F, ${location[2] + pivotOffset[2]}F)
        .rotateLocal(new Quaternionf().lookAlong(context.getFacing().getDirection().toVector3f().mul(-1F, -1F, 1F), new Vector3f(0, 1, 0)))
    )
    .build(block.getLocation().toCenterLocation())
);
    `.trim().replace(/--/g, "");
}

function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
