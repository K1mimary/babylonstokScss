import './styles/index.scss';
import './assets/fonts/Roboto-Regular.ttf';
import './component.js';
import * as BABYLON from 'babylonjs';

var canvas = document.getElementById("babylon");
var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false
  });
};
var createScene = function() {
  let scene = new BABYLON.Scene(engine);
  let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);
  let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // Our built-in 'sphere' shape.
  var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {
    diameter: .3,
    segments: 32
  }, scene);
  // Move the sphere upward 1/2 its height
  sphere.position.y = 1;
  // Our built-in 'ground' shape.
  var ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: 6,
    height: 6
  }, scene);
  window.quadraticBezierVectors = BABYLON.Curve3.CreateQuadraticBezier(
    new BABYLON.Vector3(0, 0, -3),
    new BABYLON.Vector3(0, 3, 0),
    new BABYLON.Vector3(0, 0, 3),
    120);
let points = window.quadraticBezierVectors.getPoints();
var quadraticBezierCurve = BABYLON.Mesh.CreateLines("qbezier", points, scene);
quadraticBezierCurve.color = new BABYLON.Color3(1, 1, 0.5);
let BallOBS = null;
canvas.onkeydown = hitBall;
function hitBall(){
  if (BallOBS == null){
    let j = 0;
    let k = 5;
    BallOBS  = scene.onBeforeRenderObservable.add(function() {
      scene.getMeshByName("sphere").position.set(points[j].x,points[j].y,points[j].z);
      j+=k;
      k= j < (points.length-1)/3 ? 5 : j < (points.length-1)*2/3 ? 4 : 3
      if(j >= points.length-1){
        scene.onBeforeRenderObservable.remove(BallOBS);
        setTimeout(()=>{
          BallOBS=null;
          scene.getMeshByName("sphere").position.set(0,0,-3);
        },400)
      }
    })
  }
}


  return scene;
};

var asyncEngineCreation = async function() {
  console.log(createDefaultEngine())
  try {
    return createDefaultEngine();
  } catch (e) {
    console.log("the available createEngine function failed. Creating the default engine instead");
    return createDefaultEngine();
  }
}
window.initFunction = async function() {

  engine = await asyncEngineCreation();
  if (!engine) throw 'engine should not be null.';
  scene = createScene();
  window.scene = scene;
};
window.initFunction().then(() => {
  sceneToRender = scene
  engine.runRenderLoop(function() {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
});

// Resize
window.addEventListener("resize", function() {
  engine.resize();
});
