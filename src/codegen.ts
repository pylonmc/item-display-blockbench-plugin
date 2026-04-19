export function generateCode(cubes: Cube[]): string {
    if (cubes.length === 0) {
        return `// There is nothing to display!
// Try adding some cubes to get started!`;
    }
    const seenIds = new Map<string, number>();
    let code = "";
    for (const cube of cubes) {
        const baseId = cube.name;
        const count = seenIds.get(baseId) ?? 0;
        seenIds.set(baseId, count + 1);
        const id = count === 0 ? baseId : `${baseId}_${count}`;
        code += generateForCube(id, cube) + "\n\n";
    }
    return code.trim();
}

function generateForCube(id: string, cube: Cube): string {
    let size = cube.to.map((coord, index) => coord - cube.from[index]);
    const location = cube.from.map((coord, index) => coord + size[index] / 2 - 0.5);
    const pivotOffset = cube.origin.map((coord, index) => coord - location[index] - 0.5);
    size = size.map(s => s + randomTinyOffset()); // add tiny random offset to prevent z-fighting when multiple cubes have the same size
    let result = `
addEntity("${id}", new ItemDisplayBuilder()
    .itemStack(ItemStackBuilder.of(Registry.MATERIAL.getOrThrow(NamespacedKey.minecraft("${cube.material}")))
        .addCustomModelDataString(getKey() + ":${cube.name}"))
    .transformation(new Matrix4f()
        .scaleLocal(${coerceSmallToZero(size[0])}F, ${coerceSmallToZero(size[1])}F, ${coerceSmallToZero(size[2])}F)
        .translateLocal(-${coerceSmallToZero(pivotOffset[0])}F, -${coerceSmallToZero(pivotOffset[1])}F, -${coerceSmallToZero(pivotOffset[2])}F)
        .rotateLocalX(${coerceSmallToZero(degreesToRadians(cube.rotation[0]))}F)
        .rotateLocalY(${coerceSmallToZero(degreesToRadians(cube.rotation[1]))}F)
        .rotateLocalZ(${coerceSmallToZero(degreesToRadians(cube.rotation[2]))}F)
        .translateLocal(${coerceSmallToZero(location[0] + pivotOffset[0])}F, ${coerceSmallToZero(location[1] + pivotOffset[1])}F, ${coerceSmallToZero(location[2] + pivotOffset[2])}F)
        .rotateLocal(new Quaternionf().lookAlong(context.getFacing().getDirection().toVector3f().mul(-1F, -1F, 1F), new Vector3f(0, 1, 0)))
    )
    .build(block.getLocation().toCenterLocation())
);
    `.trim();
    result = result.replace(/--/g, "");
    result = result.replace(/-0F/g, "0F");
    result = result.replace(/\n\s+\.rotateLocal[XYZ]\(0F\)/g, "");
    result = result.replace(/\n\s+\.translateLocal\(0F, 0F, 0F\)/g, "");
    return result;
}

function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

function coerceSmallToZero(value: number): number {
    return Math.abs(value) < 1e-10 ? 0 : value;
}

function randomTinyOffset(): number {
    return (Math.random() - 0.5) * 0.001;
}