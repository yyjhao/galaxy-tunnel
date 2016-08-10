import Tunnel from "./tunnel";
import MapGenerator from "./map_generator";
import Player from "./player";
import { Control as PlayerControl } from "./player"
import Display from "./display";
import Galaxy from "./galaxy";
import Star from "./star";
import * as Stars from "./stars";

export interface Control extends PlayerControl {

}

export interface Object {
    update: () => any;
    setupScene: (display: Display) => any;
    updateScene: (display: Display) => any;
}

export default class World {
    player: Player;
    tunnel: Tunnel;
    galaxy: Galaxy;
    mapGenerator: MapGenerator;
    objects: Object[];

    constructor() {
        this.player = new Player();
        this.mapGenerator = new MapGenerator(1000);
        this.tunnel = new Tunnel(this.mapGenerator);
        this.galaxy = new Galaxy();

        this.objects = this.mapGenerator.getStars().map((pos) => {
            return Stars.genRandom(pos);
        });
    }

    update(control: Control) {
        this.galaxy.update();
        this.tunnel.update(this.player.getPlayerTracker());
        this.player.update(this, control);

        this.objects.forEach((obj) => {
            obj.update();
        });
    }

    setupScene(display: Display) {
        this.galaxy.setupScene(display);
        this.tunnel.setupScene(display);
        this.player.setupScene(display);
        this.player.setupPlayerTracker(this.tunnel.getBeginningSection());

        this.objects.forEach((obj) => {
            obj.setupScene(display);
        });
    }

    updateScene(display: Display) {
        this.galaxy.updateScene(display);
        this.tunnel.updateScene(display);
        this.player.updateScene(display);

        this.objects.forEach((obj) => {
            obj.updateScene(display);
        });
    }
}
