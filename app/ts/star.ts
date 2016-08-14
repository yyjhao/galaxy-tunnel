import {
    Vector3,
    Face3,
    Line,
    Matrix4,
    BufferGeometry,
    ImageUtils,
    LineBasicMaterial,
    BoxGeometry,
    Geometry,
    Mesh,
    MeshBasicMaterial,
    Material,
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
    PointLight,
    ShaderMaterial,
    AdditiveBlending,
    FrontSide
} from "three"

import Display from "./display";

var starVertex = `
uniform sampler2D noiseTexture;
uniform float noiseScale;

uniform sampler2D bumpTexture;
uniform float bumpSpeed;
uniform float bumpScale;

uniform float time;

varying vec2 vUv;

void main()
{
    vUv = uv;

	vec2 uvTimeShift = vUv + vec2( 1.1, 1.9 ) * time * bumpSpeed;
	vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );
	vec2 uvNoiseTimeShift = vUv + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.g );
	// below, using uvTimeShift seems to result in more of a "rippling" effect
	//   while uvNoiseTimeShift seems to result in more of a "shivering" effect
	vec4 bumpData = texture2D( bumpTexture, uvTimeShift );

	// move the position along the normal
	//  but displace the vertices at the poles by the same amount
	float displacement = ( vUv.y > 0.999 || vUv.y < 0.001 ) ?
		bumpScale * (0.3 + 0.02 * sin(time)) :
		bumpScale * bumpData.r;
    vec3 newPosition = position + normal * displacement;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
`;

var starFragment = `
uniform sampler2D baseTexture;
uniform float baseSpeed;
uniform float repeatS;
uniform float repeatT;

uniform sampler2D noiseTexture;
uniform float noiseScale;

uniform sampler2D blendTexture;
uniform float blendSpeed;
uniform float blendOffset;

uniform float time;
uniform float alpha;

varying vec2 vUv;

void main()
{
   vec2 uvTimeShift = vUv + vec2( -0.7, 1.5 ) * time * baseSpeed;
   vec4 noiseGeneratorTimeShift = texture2D( noiseTexture, uvTimeShift );
   vec2 uvNoiseTimeShift = vUv + noiseScale * vec2( noiseGeneratorTimeShift.r, noiseGeneratorTimeShift.b );
   vec4 baseColor = texture2D( baseTexture, uvNoiseTimeShift * vec2(repeatS, repeatT) );

   vec2 uvTimeShift2 = vUv + vec2( 1.3, -1.7 ) * time * blendSpeed;
   vec4 noiseGeneratorTimeShift2 = texture2D( noiseTexture, uvTimeShift2 );
   vec2 uvNoiseTimeShift2 = vUv + noiseScale * vec2( noiseGeneratorTimeShift2.g, noiseGeneratorTimeShift2.b );
   vec4 blendColor = texture2D( blendTexture, uvNoiseTimeShift2 * vec2(repeatS, repeatT) ) - blendOffset * vec4(1.0, 1.0, 1.0, 1.0);

   vec4 theColor = (baseColor + blendColor) / 2.0;
   theColor.a = alpha;
   gl_FragColor = theColor;
}
`;

var noiseTexture = (new TextureLoader()).load( 'cloud.png' );
noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping;

export var haloScale = 1.2;

export default class Star {
    mesh: Mesh;
    starUniforms: any;
    size: number;
    rotationMatrix: Matrix4;
    position: Vector3;

    constructor(position: Vector3, attr: {
        color: Color;
        texture: Texture;
        applyDistortion: boolean;
        size: number;
    }) {
        this.size = attr.size;
        this.position = position;
        var starMaterial: Material;
        attr.texture.wrapS = attr.texture.wrapT = RepeatWrapping;
        if (attr.applyDistortion) {
        	this.starUniforms = {
        		baseTexture: 	{ type: "t", value: attr.texture },
        		baseSpeed:		{ type: "f", value: 0.02 },
        		repeatS:		{ type: "f", value: 1.0 },
        		repeatT:		{ type: "f", value: 1.0 },
        		noiseTexture:	{ type: "t", value: noiseTexture },
        		noiseScale:		{ type: "f", value: 0.5 },
        		blendTexture:	{ type: "t", value: attr.texture },
        		blendSpeed: 	{ type: "f", value: 0.01 },
        		blendOffset: 	{ type: "f", value: 0.25 },
        		bumpTexture:	{ type: "t", value: noiseTexture },
        		bumpSpeed: 		{ type: "f", value: 0.15 },
        		bumpScale: 		{ type: "f", value: 100.0 },
        		alpha: 			{ type: "f", value: 1.0 },
        		time: 			{ type: "f", value: 1.0 }
        	};

        	starMaterial = new ShaderMaterial({
        	    uniforms: this.starUniforms,
        		vertexShader:   starVertex,
        		fragmentShader: starFragment
        	});
        } else {
            starMaterial = new MeshBasicMaterial({
                map: attr.texture
            });
        }
        var shiny = new Mesh(new SphereGeometry(attr.size, 32, 32), starMaterial);

        shiny.add(new PointLight(0xffcccc, 2, attr.size * 5, 1));

        shiny.position.copy(position);

        this.mesh = shiny;
        var priorRotationMatrix = new Matrix4();
        var axis = new Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
        );
        priorRotationMatrix.makeRotationAxis(axis.normalize(), Math.random());

        this.mesh.matrix.multiply(priorRotationMatrix);

        this.rotationMatrix = new Matrix4();
        this.rotationMatrix.makeRotationAxis(new Vector3(0, 1, 0), Math.random() * 0.02 + 0.01)

        this.mesh.rotation.setFromRotationMatrix(this.mesh.matrix);
    }

    update() {
        this.mesh.matrix.multiply(this.rotationMatrix);
        this.mesh.rotation.setFromRotationMatrix(this.mesh.matrix);
        if (this.starUniforms) {
        	this.starUniforms.time.value = Date.now() % 1000000 / 500;
        }
    }

    setupScene(display: Display) {
        display.scene.add(this.mesh);
    }

    updateScene(display: Display) {
    }

    getWrapSize() {
        return this.size;
    }

    setPosition(position: Vector3) {
        this.position.copy(position);
        this.mesh.position.copy(position);
    }
}
