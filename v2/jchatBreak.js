function jchatBreak() {
    const pl = planck, Vec2 = pl.Vec2;
    const gravity = Vec2(0, -10)

    const world = pl.World(gravity);

    let barLeft = world.createBody();
    let barBottom = world.createBody();
    let barRight = world.createBody();

    // barLeft.createFixture(pl.Edge(Vec2(-20, 5), Vec2(20, 5)));
    // bar.setAngle(0.2);

    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            let box = world.createBody().setDynamic();
            box.createFixture(pl.Box(0.5, 0.5));
            box.setPosition(Vec2(i * 1, -j * 1 + 20));
            box.setMassData({
                mass : 1,
                center : Vec2(),
                I : 1
            })
        }
    }

    return world
}