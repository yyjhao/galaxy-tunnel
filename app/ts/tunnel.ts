import {
    Vector3,
    Face3,
    Line,
    BufferGeometry,
    LineBasicMaterial,
    BoxGeometry,
    Geometry,
    Mesh,
    MeshBasicMaterial,
    MeshLambertMaterial,
    Scene,
    LineSegments,
    MeshPhysicalMaterial,
    SmoothShading,
    BackSide,
    MeshStandardMaterial,
    MeshPhongMaterial,
    Color,
    DirectionalLight,
    TextureLoader,
    RepeatWrapping,
    RGBFormat,
    CubeCamera,
    DoubleSide,
    SphereGeometry,
    PointLight,
    Texture,
    Raycaster,
} from "three"

import MapGenerator from "./map_generator";
import Display from "./display";
import Section from "./section";
import PlayerTracker from "./player_tracker";

export default class Tunnel {
    private _mapGenerator: MapGenerator;
    private _isConstructed: boolean;
    private _curSection: Section;
    private _lastReusableSection: Section;
    private _sectionLength: number;
    private _nextPos: Vector3;
    private _maxDisplaySection = 200;
    private _counter = 0;
    private _toAddSection: boolean;
    private _sectionsPassed: number;

    constructor(mapGenerator: MapGenerator) {
        this._mapGenerator = mapGenerator;
        this._sectionLength = 0;
    }

    update(playerTracker: PlayerTracker) {
        this._sectionsPassed = playerTracker.getSectionsPassed();
        if (this._sectionLength - playerTracker.getSectionsPassed() < this._maxDisplaySection / 2) {
            this._toAddSection = true;
        }
    }

    setupScene(display: Display) {
        while (this._maxDisplaySection > this._sectionLength) {
            this.genNewSection(display);
        }
    }

    getBeginningSection() {
        return this._lastReusableSection;
    }

    updateScene(display: Display) {
        if (this._toAddSection) {
            this.genNewSection(display);
            this._toAddSection = false;
        }
        this._counter++;
    }

    genNewSection(display: Display) {
        if (!this._nextPos) {
            this._nextPos = this._mapGenerator.getNext().position;
        }
        var curPos = this._nextPos;
        var next = this._mapGenerator.getNext();
        this._nextPos = next.position;
        this.addSection(curPos, this._nextPos, next.size, display.scene);
    }

    addSection(start: Vector3, end: Vector3, size: number, scene: Scene) {
        if (this._sectionLength < this._maxDisplaySection) {
            this._curSection = new Section(this._curSection, start, end, size);
            if (!this._lastReusableSection) {
                this._lastReusableSection = this._curSection;
            }
        } else {
            var section = this._lastReusableSection;
            this._lastReusableSection = section.nextSection;
            section.removeFrom(scene);
            this._curSection = new Section(this._curSection, start, end, size);
        }
        this._sectionLength += 1;
        this._curSection.addTo(scene);
    }
}
