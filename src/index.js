window.app = {
  el: document.getElementById("app"),
  scene: null,
  renderer: null,
  camera: null,
  keyboard: 'qwerty', // It hurts me but default should be qwerty
  world: null
}

const init = () => {

  app.renderer = new THREE.WebGLRenderer()
  app.renderer.setSize(window.innerWidth, window.innerHeight)
  
  app.renderer.gammaOutput = true
  app.renderer.antialias = true
  
  app.scene   = new THREE.Scene()
  app.camera  = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000)
  app.clock   = new THREE.Clock()

  app.el.appendChild(app.renderer.domElement)

  initKeyboard()
}

const render = () => {
  
  // Limit to 24 FPS 
  setTimeout(() => requestAnimationFrame(render), 1000 / 24 );
    
  // Hook for world events
  world.render()
  
  app.renderer.render(app.scene, app.camera)
}

const initKeyboard = () => {

  const keyboard = document.getElementById('keyboard')
  keyboard.value = app.keyboard

  changeKeyboard()

  keyboard.addEventListener('change', changeKeyboard)
}

const changeKeyboard = () => {

  app.keyboard = keyboard.value
  
  if(keyboard.value === 'azerty') {
    document.getElementById('azerty').setAttribute('style', '')
    document.getElementById('qwerty').setAttribute('style', 'display: none')
  }
  else {
    document.getElementById('azerty').setAttribute('style', 'display: none')
    document.getElementById('qwerty').setAttribute('style', '')
  }
}

init()

const world = new World(app)
window.app.world = world 

render(world)

document.getElementById('close').addEventListener('click', () => document.getElementById('options').setAttribute('style', 'display: none'))
