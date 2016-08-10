import {
    TextureLoader,
    Vector3,
    Color
} from "three";

import Star from "./star";

var loader = new TextureLoader();
var sunTexture = loader.load("sun.jpg");
var ioTexture = loader.load("io.jpg");
var jupiterTexture = loader.load("jupiter.jpg");
var marsTexture = loader.load("mars.jpg");
var neptuneTexture = loader.load("neptune.jpg");
var saturnTexture = loader.load("saturn.jpg");
var uranusTexture = loader.load("uranus.jpg");
var venusTexture = loader.load("venus.jpg");
var trantorTexture = loader.load("trantor.png");

export class Sun extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xFB7516),
            texture: sunTexture,
            displayLight: true,
            displayHalo: true,
            applyDistortion: true,
            size: 50000
        })
    }
}

export class Io extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xffffff),
            texture: ioTexture,
            displayLight: false,
            displayHalo: false,
            applyDistortion: true,
            size: 5000
        })
    }
}

export class Jupiter extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xffffff),
            texture: jupiterTexture,
            displayLight: false,
            displayHalo: false,
            applyDistortion: true,
            size: 10000
        })
    }
}

export class Mars extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xCA9346),
            texture: marsTexture,
            displayLight: false,
            displayHalo: true,
            applyDistortion: false,
            size: 1000
        })
    }
}

export class Neptune extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0x7AB1D2),
            texture: neptuneTexture,
            displayLight: true,
            displayHalo: true,
            applyDistortion: true,
            size: 5000
        })
    }
}

export class Saturn extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xffffff),
            texture: saturnTexture,
            displayLight: false,
            displayHalo: false,
            applyDistortion: false,
            size: 4000
        })
    }
}

export class Uranus extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xffffff),
            texture: uranusTexture,
            displayLight: false,
            displayHalo: false,
            applyDistortion: false,
            size: 2000
        })
    }
}

export class Venus extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xffffff),
            texture: venusTexture,
            displayLight: false,
            displayHalo: false,
            applyDistortion: false,
            size: 1000
        })
    }
}

export class Trantor extends Star {
    constructor(position: Vector3) {
        super(position, {
            color: new Color(0xffffff),
            texture: trantorTexture,
            displayLight: false,
            displayHalo: false,
            applyDistortion: false,
            size: 1000
        })
    }
}

var classes = [
    Sun, Io, Jupiter, Mars, Neptune, Saturn, Uranus, Venus, Trantor
];
export function genRandom(position: Vector3): Star {
    return new classes[Math.floor(Math.random() * classes.length)](position);
}
