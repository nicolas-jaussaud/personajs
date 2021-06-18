window.app = {
  el: document.getElementById("app"),
  scene: null,
  renderer: null,
  camera: null,
  keyboard: null,
  world: null
}

const init = () => {

  app.renderer = new THREE.WebGLRenderer()
  app.renderer.setSize(window.innerWidth, window.innerHeight)

  app.el.appendChild(app.renderer.domElement)
  
  app.scene = new THREE.Scene()
  app.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  app.clock = new THREE.Clock()

  // Ugly way to ask if the user use azerty or qwerty
  app.keyboard = confirm('Do you want to use an AZERTY layout? (otherwise will use QWERTY)') ? 'azerty' : 'qwerty' 
}

const render = () => {
  
  // Limit to 24 FPS 
  setTimeout(() => requestAnimationFrame(render), 1000 / 24 );
    
  // Hook for world events
  world.render()
  
  app.renderer.render(app.scene, app.camera)
}

init()

const world = new World(app)
window.app.world = world 

render(world)
    