import {
    Face3,
    Vector3,
} from "three";

export function addQuadFaces(faces: Face3[], a: number, b: number, c: number, d: number) {
    faces.push(new Face3(a, b, c));
    // faces.push(new Face3(c, b, a));

    // faces.push(new Face3(b, c, d));
    faces.push(new Face3(d, c, b));
}

export function dist(a: Vector3, b: Vector3) {
    return new Vector3().subVectors(a, b).length();
}

export function randomRange(a: number, b: number) {
    return Math.random() * (b - a) + a;
}
