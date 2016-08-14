import {
    Vector3,
    Face3,
    Line,
    BufferGeometry,
    ImageUtils,
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
    Texture,
    SphereGeometry,
    PointLight
} from "three"

import {
    addQuadFaces
} from "./util";

var posConst = [
    new Vector3(-200, 160, 0),
    new Vector3(-200, -160, 0),
    new Vector3(-160, -200, 0),
    new Vector3(160, -200, 0),
    new Vector3(200, -160, 0),
    new Vector3(200, 160, 0),
    new Vector3(160, 200, 0),
    new Vector3(-160, 200, 0),
];

posConst.forEach(function(pos) {
    pos.x *= 3;
    pos.y *= 3;
});

var faceMaterial: MeshPhysicalMaterial;

var lineWidth = 30;

export default class Section {
    static size = 200 * 3;
    private lines: Mesh;
    private faces: Mesh;

    nextSection: Section;
    pos: Vector3;
    points: Vector3[];
    cubeCamera: CubeCamera;

    constructor(previousSection: Section, position: Vector3, nextPosition: Vector3, size: number, envMap: Texture) {
        if (previousSection) {
            previousSection.nextSection = this;
        }
        this.pos = position;
        var geometry = new Geometry();

        posConst.forEach(function(delta) {
            geometry.vertices.push(delta.clone().multiplyScalar(size));
        });

        geometry.lookAt(new Vector3().subVectors(nextPosition, position));
        geometry.translate(position.x, position.y, position.z);

        this.points = [];
        geometry.vertices.forEach((v) => {
            this.points.push(v);
        });
        geometry.vertices.length = 0;

        if (previousSection) {
            var faceGeometry = new Geometry();
            var previousPoints = previousSection.points;

            for (var i = 0; i < 8; i++) {

                var vec1 = this.points[i];
                var vec2 = this.points[(i + 1) % 8];
                var vec3 = previousPoints[i];
                var vec4 = previousPoints[(i + 1) % 8];

                var vec12 = new Vector3().subVectors(vec2, vec1).setLength(lineWidth);
                var vec13 = new Vector3().subVectors(vec3, vec1).setLength(lineWidth);

                var vecInner1 = new Vector3().addVectors(vec1, vec12).add(vec13);

                faceGeometry.vertices.push(vecInner1);

                var vec24 = new Vector3().subVectors(vec4, vec2).setLength(lineWidth);
                var vecInner2 = new Vector3().addVectors(vec2, vec24).sub(vec12);
                faceGeometry.vertices.push(vecInner2);

                var vec34 = new Vector3().subVectors(vec4, vec3).setLength(lineWidth);
                var vecInner3 = new Vector3().addVectors(vec3, vec34).sub(vec13);
                var vecInner4 = new Vector3().subVectors(vec4, vec34).sub(vec24);
                faceGeometry.vertices.push(vecInner3, vecInner4);

                addQuadFaces(faceGeometry.faces, i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 3);

                geometry.vertices.push(vec1.clone());
                geometry.vertices.push(vec2.clone());
                geometry.vertices.push(vec3.clone());
                geometry.vertices.push(vec4.clone());
                geometry.vertices.push(vecInner1.clone());
                geometry.vertices.push(vecInner2.clone());
                geometry.vertices.push(vecInner3.clone());
                geometry.vertices.push(vecInner4.clone());

                addQuadFaces(geometry.faces, i * 8, i * 8 + 1, i * 8 + 4, i * 8 + 5);
                addQuadFaces(geometry.faces, i * 8 + 1, i * 8 + 3, i * 8 + 5, i * 8 + 7);
                addQuadFaces(geometry.faces, i * 8, i * 8 + 2, i * 8 + 4, i * 8 + 6);
                addQuadFaces(geometry.faces, i * 8 + 2, i * 8 + 3, i * 8 + 6, i * 8 + 7);
            }

            var faceMaterial = new MeshPhysicalMaterial( {
                color: 0x8DEEEE,
                metalness: 0.9,
                roughness: 0,
                // opacity: 0.1,
                reflectivity: 0.98,
                side: DoubleSide,
                transparent: true,
                shading: SmoothShading,
                envMapIntensity: 1,
                premultipliedAlpha: true,
                refractionRatio: 0.99,
                envMap: envMap
            });
            // var faceMaterial = new MeshBasicMaterial( { color: 0xffffff, envMap: envMap, refractionRatio: 0.4} )
            this.faces = new Mesh(faceGeometry, faceMaterial);
            faceGeometry.computeFaceNormals();
            faceGeometry.computeVertexNormals();

            this.lines = new Mesh(geometry, new MeshLambertMaterial( {
                color: 0xffffff,
                reflectivity: 1,
                side: DoubleSide
            }));
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
        }
    }

    setVisible(visible: boolean) {
        if (this.lines) {
            this.lines.visible = visible;
        }
        if (this.faces) {
            this.faces.visible = visible;
        }
    }

    setFacesVisible(visible: boolean) {
        if (this.faces) {
            this.faces.visible = visible;
        }
    }

    addTo(scene: Scene) {
        if (this.lines) {
            scene.add(this.lines);
        }
        if (this.faces) {
            scene.add(this.faces);
        }
    }

    removeFrom(scene: Scene) {
        if (this.lines) {
            scene.remove(this.lines);
        }
        if (this.faces) {
            scene.remove(this.faces);
        }
    }
}
