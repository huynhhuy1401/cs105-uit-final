// Find the latest version by visiting https://cdn.skypack.dev/three.
import * as THREE from './js/three.module.js'
import { OrbitControls } from './js/OrbitControls.js'
import { TransformControls } from './js/TransformControls.js'
import { GUI } from './js/dat.gui.module.js'
import Stats from './js/stats.module.js'
import { TGALoader } from './js/TGALoader.js';
import { TeapotGeometry } from './js/TeapotGeometry.js';

// globale variables
let camera, scene, renderer
let floor, geometry, material, mesh, floorMesh, light, axes
let gui
let stats
let loader = new TGALoader()
let textureLoader = new THREE.TextureLoader()

// controls 
let obControls, afControls

// gui settings
let settings = {
    common: {
        showaxes: true,
        background: 'rgb(80,80,80)'
    },
    geometry: {
        scale: 1,
        shape: 'cube',
        material: 'basic',
        wireframe: false,
        color: 0x999999,
    },
    light: {
        type: 'point',
        enable: true,
        shadow: true,
        intensity: 1,
        color: 0xffffff,
        posY: 2,
        posZ: 0,
        posX: 0,
    },
    affine: {
        mode: 'none',
    },
    camera: {
        fov: 75,
        near: 0.1,
        far: 100,
        posX: 1,
        posY: 2,
        posZ: 4,
        lookX: 0,
        lookY: 0,
        lookZ: 0,
    },
    animation: {
        play: false,
        type: 'go up and down',
    }
}

init()
initGUI()
animate()

function init() {
    // scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color(settings.common.background)

    // camera
    camera = new THREE.PerspectiveCamera(settings.camera.fov, window.innerWidth / window.innerHeight, settings.camera.near, settings.camera.far)
    camera.position.set(settings.camera.posX, settings.camera.posY, settings.camera.posZ)
    camera.lookAt(settings.camera.lookX, settings.camera.lookY, settings.camera.lookZ)

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)

    // axes
    axes = new THREE.AxesHelper(5)
    scene.add(axes)

    // floor
    geometry = new THREE.PlaneBufferGeometry(10, 10, 10, 10)
    let floorMat = new THREE.MeshPhongMaterial({ color: 0x222222, side: THREE.DoubleSide })
    floor = new THREE.Mesh(geometry, floorMat)

    // floor mesh
    floorMesh = new THREE.Mesh(geometry, floorMat)
    floorMesh.rotation.x = -Math.PI / 2
    floorMesh.position.y = -0.5
    floorMesh.receiveShadow = true
    scene.add(floorMesh)

    // object
    geometry = new THREE.BoxBufferGeometry(1, 1, 1)
    material = new THREE.MeshBasicMaterial({ color: settings.geometry.color, side: THREE.DoubleSide })
    mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0.5, 0)
    mesh.castShadow = true
    mesh.receiveShadow = false
    scene.add(mesh)

    // light
    light = new THREE.PointLight(settings.light.color, 2, 100)
    light.position.set(settings.light.posX, settings.light.posY, settings.light.posZ)
    light.castShadow = true

    // shadow
    light.shadow.mapSize.width = 1024
    light.shadow.mapSize.height = 1024
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 50

    // add light to scene
    scene.add(light)

    // transform controls
    obControls = new OrbitControls(camera, renderer.domElement)
    obControls.enableDamping = true
    obControls.dampingFactor = 0.25
    obControls.enableZoom = true
    obControls.minDistance = 0.5
    obControls.maxDistance = 1000
    obControls.minPolarAngle = 0
    obControls.maxPolarAngle = Math.PI / 2

    // affine controls
    afControls = new TransformControls(camera, renderer.domElement)
    afControls.addEventListener('change', () => {
        // console.log(afControls.object.position)
        renderer.render(scene, camera)
    })
    afControls.addEventListener('dragging-changed', (event) => {
        if (event.value) {
            obControls.enabled = false
        } else {
            obControls.enabled = true
        }
    })
    scene.add(afControls)

    // stats
    stats = new Stats()
    stats.showPanel(0)
    document.body.appendChild(stats.dom)

    window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

function animate() {
    requestAnimationFrame(animate)

    if (settings.animation.play) {
        switch (settings.animation.type) {
            case 'go up and down':
                mesh.position.y = Math.sin(performance.now() * 0.001) * 0.5
                break
            case 'go left and right':
                mesh.position.x = Math.sin(performance.now() * 0.001) * 0.5
                break
            case 'go forward and backward':
                mesh.position.z = Math.sin(performance.now() * 0.001) * 0.5
                break
            case 'rotate':
                mesh.rotation.y = performance.now() * 0.001
                break
            case 'go around':
                mesh.position.x = Math.sin(performance.now() * 0.001) * 0.5
                mesh.position.z = Math.cos(performance.now() * 0.001) * 0.5
                break
            default:
                break
        }
    }

    stats.update()
    renderer.render(scene, camera)
}

function initGUI() {
    // gui  
    gui = new GUI()

    // common
    let h = gui.addFolder('common')

    h.addColor(settings.common, 'background').onChange(() => {
        scene.background = new THREE.Color(settings.common.background)
    })

    h.add(settings.common, 'showaxes').onChange(() => {
        if (settings.common.showaxes) {
            scene.add(axes)
        } else {
            scene.remove(axes)
        }
    })

    // geometry
    let g = gui.addFolder('geometry')
    g.add(settings.geometry, 'scale', 0.1, 10).onChange(() => {
        if (mesh) {
            mesh.scale.set(settings.geometry.scale, settings.geometry.scale, settings.geometry.scale)
        }
    })

    g.add(settings.geometry, 'shape', ['cube', 'sphere', 'cone', 'cylinder', 'dodecahedron', 'tetrahedron', 'torus', 'torusknot', 'teapot']).onChange(() => {
        if (settings.geometry.shape === 'cube') {
            geometry = new THREE.BoxBufferGeometry(1, 1, 1)
        } else if (settings.geometry.shape === 'sphere') {
            geometry = new THREE.SphereBufferGeometry(1, 32, 32)
        } else if (settings.geometry.shape === 'cone') {
            geometry = new THREE.ConeBufferGeometry(1, 2, 32)
        } else if (settings.geometry.shape === 'cylinder') {
            geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 32)
        } else if (settings.geometry.shape === 'dodecahedron') {
            geometry = new THREE.DodecahedronBufferGeometry(1, 0)
        } else if (settings.geometry.shape === 'tetrahedron') {
            geometry = new THREE.TetrahedronBufferGeometry(1, 0)
        } else if (settings.geometry.shape === 'torus') {
            geometry = new THREE.TorusBufferGeometry(1, 0.3, 32, 32)
        } else if (settings.geometry.shape === 'torusknot') {
            geometry = new THREE.TorusKnotBufferGeometry(1, 0.1, 32, 32)
        } else if (settings.geometry.shape === 'teapot') {
            geometry = new TeapotGeometry(0.5)
        }
        mesh.geometry = geometry
        mesh.position.set(0, 0.5, 0)
    })

    g.add(settings.geometry, 'material', ['basic', 'lambert', 'phong', 'wireframe', 'crate texture', 'earth texture']).onChange(() => {
        if (settings.geometry.material === 'basic') {
            material = new THREE.MeshBasicMaterial({ color: settings.geometry.color, side: THREE.DoubleSide })
        } else if (settings.geometry.material === 'lambert') {
            material = new THREE.MeshLambertMaterial({ color: settings.geometry.color, side: THREE.DoubleSide })
        } else if (settings.geometry.material === 'phong') {
            material = new THREE.MeshPhongMaterial({ color: settings.geometry.color, side: THREE.DoubleSide })
        } else if (settings.geometry.material === 'crate texture') {
            let texture = loader.load('./textures/crate_color8.tga')
            material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
        } else if (settings.geometry.material === 'wireframe') {
            material = new THREE.MeshBasicMaterial({ color: settings.geometry.color, wireframe: true, side: THREE.DoubleSide })
        } else if (settings.geometry.material === 'earth texture') {
            material = new THREE.MeshPhongMaterial({

                specular: 0x333333,
                shininess: 15,
                map: textureLoader.load("./textures/planets/earth_atmos_2048.jpg"),
                specularMap: textureLoader.load("./textures/planets/earth_specular_2048.jpg"),
                normalMap: textureLoader.load("./textures/planets/earth_normal_2048.jpg"),

                // y scale is negated to compensate for normal map handedness.
                normalScale: new THREE.Vector2(0.85, - 0.85)
            })
        }
        mesh.material = material
    })

    g.addColor(settings.geometry, 'color').onChange(() => {
        if (settings.geometry.material === 'basic') {
            material = new THREE.MeshBasicMaterial({ color: settings.geometry.color, side: THREE.DoubleSide })
        } else if (settings.geometry.material === 'lambert') {
            material = new THREE.MeshLambertMaterial({ color: settings.geometry.color, side: THREE.DoubleSide })
        } else if (settings.geometry.material === 'phong') {
            material = new THREE.MeshPhongMaterial({ color: settings.geometry.color, side: THREE.DoubleSide })
        }
        mesh.material = material
    })

    // affine
    let f = gui.addFolder('affine transformation')
    f.add(settings.affine, 'mode', ['none', 'translate', 'rotate', 'scale']).onChange(() => {
        if (settings.affine.mode === 'none') {
            afControls.detach()
        } else {
            afControls.setMode(settings.affine.mode)
            afControls.attach(mesh)
        }
        mesh.position.set(0, 0.5, 0)
    })

    // light
    let l = gui.addFolder('light and shadow')
    l.add(settings.light, 'type', ['point', 'spot', 'directional']).onChange(() => {
        scene.remove(light)
        if (settings.light.type === 'point') {
            light = new THREE.PointLight(settings.light.color, 2, 100)
        } else if (settings.light.type === 'spot') {
            light = new THREE.SpotLight(settings.light.color, 2, 100)
        } else if (settings.light.type === 'directional') {
            light = new THREE.DirectionalLight(settings.light.color, 2)
        }
        light.position.set(settings.light.posX, settings.light.posY, settings.light.posZ)
        light.castShadow = settings.light.shadow
        scene.add(light)
    })

    l.add(settings.light, 'intensity', 0, 10).onChange(() => {
        light.intensity = settings.light.intensity
    })

    l.add(settings.light, 'shadow', false).onChange(() => {
        light.castShadow = settings.light.shadow
    })

    l.addColor(settings.light, 'color').onChange(() => {
        light.color = new THREE.Color(settings.light.color)
    })

    l.add(settings.light, 'posX', -10, 10).onChange(() => {
        light.position.set(settings.light.posX, settings.light.posY, settings.light.posZ)
    })

    l.add(settings.light, 'posY', -10, 10).onChange(() => {
        light.position.set(settings.light.posX, settings.light.posY, settings.light.posZ)
    })

    l.add(settings.light, 'posZ', -10, 10).onChange(() => {
        light.position.set(settings.light.posX, settings.light.posY, settings.light.posZ)
    })

    // camera
    let c = gui.addFolder('camera')
    c.add(settings.camera, 'fov', 1, 180).onChange(() => {
        camera.fov = settings.camera.fov
        camera.updateProjectionMatrix()
    })

    c.add(settings.camera, 'near', 0.1, 10).onChange(() => {
        camera.near = settings.camera.near
        camera.updateProjectionMatrix()
    })

    c.add(settings.camera, 'far', 0.1, 1000).onChange(() => {
        camera.far = settings.camera.far
        camera.updateProjectionMatrix()
    })

    c.add(settings.camera, 'posX', -10, 10).onChange(() => {
        camera.position.set(settings.camera.posX, settings.camera.posY, settings.camera.posZ)
    })

    c.add(settings.camera, 'posY', -10, 10).onChange(() => {
        camera.position.set(settings.camera.posX, settings.camera.posY, settings.camera.posZ)
    })

    c.add(settings.camera, 'posZ', -10, 10).onChange(() => {
        camera.position.set(settings.camera.posX, settings.camera.posY, settings.camera.posZ)
    })

    c.add(settings.camera, 'lookX', -10, 10).onChange(() => {
        camera.lookAt(settings.camera.lookX, settings.camera.lookY, settings.camera.lookZ)
    })

    c.add(settings.camera, 'lookY', -10, 10).onChange(() => {
        camera.lookAt(settings.camera.lookX, settings.camera.lookY, settings.camera.lookZ)
    })

    c.add(settings.camera, 'lookZ', -10, 10).onChange(() => {
        camera.lookAt(settings.camera.lookX, settings.camera.lookY, settings.camera.lookZ)
    })

    // animation
    let a = gui.addFolder('animation')
    a.add(settings.animation, 'play', false)

    a.add(settings.animation, 'type', ['go up and down', 'go left and right', 'go forward and backward', 'rotate', 'go around'])
}

function animation1() {
    // move up and down
    mesh.position.y += 0.01
    if (mesh.position.y > 10) {
        mesh.position.y = -10
    }
}