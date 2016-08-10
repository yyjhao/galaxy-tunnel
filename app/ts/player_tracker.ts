import {
    Vector3,
    Mesh,
    BoxGeometry,
    Raycaster,
    Geometry,
    MeshBasicMaterial,
    DoubleSide,
    Plane,
    Intersection,
    Line3
} from "three"

import Section from "./section";
import {
    addQuadFaces
} from "./util";

export default class PlayerTracker {
    _curSection: Section;
    _curSectionCenter: Vector3;
    _isOut: boolean;
    _boundingShape: Mesh;
    _movementPlane: Plane;
    _sectionsPassed: number;

    constructor(curSection: Section) {
        this.setCurSection(this.getBoundingShape(curSection), curSection);
        this._isOut = false;
        this._sectionsPassed = 1;
    }

    getSectionsPassed() {
        return this._sectionsPassed;
    }

    isOut() {
        return this._isOut;
    }

    getAdjusted(position: Vector3) {
        if (this._isOut) return position;
        // return this._movementPlane.projectPoint(position);
        return this._movementPlane.intersectLine(new Line3(position.clone().setY(-100000), position.clone().setY(100000)))
    }

    setCurSection(boundingShape: Mesh, section: Section) {
        this._boundingShape = boundingShape;
        this._curSection = section;
        this._curSectionCenter = new Vector3().addVectors(
            this._curSection.pos, this._curSection.nextSection.pos)
        .divideScalar(2);
        var vertices = (<Geometry>this._boundingShape.geometry).vertices;

        this._movementPlane = new Plane().setFromCoplanarPoints(
            new Vector3().addVectors(vertices[0], vertices[1]).divideScalar(2),
            new Vector3().addVectors(vertices[4], vertices[5]).divideScalar(2),
            new Vector3().addVectors(vertices[8], vertices[9]).divideScalar(2)
        );
    }

    getBoundingShape(section: Section) {
        var shape = new Geometry();
        for (var i = 0; i < 8; i++) {
            shape.vertices.push(section.points[i]);
        }
        for (var i = 0; i < 8; i++) {
            shape.vertices.push(section.nextSection.points[i]);
        }
        for (var i = 0; i < 8; i++) {
            addQuadFaces(shape.faces, i, (i + 1) % 8, i + 8, (i + 1) % 8 + 8);
        }
        addQuadFaces(shape.faces, 0, 1, 3, 2);
        addQuadFaces(shape.faces, 3, 4, 0, 7);
        addQuadFaces(shape.faces, 4, 5, 7, 6);

        addQuadFaces(shape.faces, 8, 9, 11, 10);
        addQuadFaces(shape.faces, 11, 12, 8, 15);
        addQuadFaces(shape.faces, 12, 13, 15, 14);


        return new Mesh(shape, new MeshBasicMaterial({
            color: 0xff0000,
            opacity: 0.7,
            transparent: true,
            side: DoubleSide
        }));
    }

    _filterIntersections(intersections: Intersection[]) {
        var result: Intersection[] = [];
        var skip: { [s: number]: boolean; } = {};
        for (var i = 0; i < intersections.length; i++) {
            if (skip[i]) continue;
            if (intersections[i].distance > 0) {
                result.push(intersections[i]);
            }
            for (var j = i + 1; j < intersections.length; j++) {
                if (skip[j]) continue;
                if (intersections[j].point.equals(intersections[i].point)) {
                    skip[j] = true;
                }
            }
        }
        return result;
    }

    updateSection(position: Vector3) {
        if (this._isOut) return;
        var disp = new Vector3().subVectors(this._curSectionCenter, position);
        if (disp.length() < Section.size * 0.9) return;
        disp.normalize();
        var ray = new Raycaster(position, disp);
        if (this._filterIntersections(ray.intersectObject(this._boundingShape)).length !== 1) {
            var nextBoundingShape = this.getBoundingShape(this._curSection.nextSection);
            if (this._filterIntersections(ray.intersectObject(nextBoundingShape)).length === 1) {
                this.setCurSection(nextBoundingShape, this._curSection.nextSection);
                this._sectionsPassed += 1;
            } else {
                this._isOut = true;
            }
        }
    }
}
