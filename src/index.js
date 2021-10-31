import World from './classes/World'

import { app } from './app'
import { init as initInterface } from './interface/index.jsx'
import { init as initAudio } from './audio/index.js'

const d = document

window.onload = () => {

  init() 

  initInterface()

  initAudio()

  render(app.world)
}

const init = () => {

  app.el = d.getElementById('app')

  app.renderer = new THREE.WebGLRenderer()
  app.renderer.setSize(window.innerWidth, window.innerHeight)
  
  app.renderer.gammaOutput = true
  app.renderer.antialias = true
  
  app.scene   = new THREE.Scene()
  app.camera  = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000)
  app.clock   = new THREE.Clock()

  app.el.appendChild(app.renderer.domElement)

  app.world = new World() 

}

const render = () => {
  
  // Limit to 24 FPS 
  setTimeout(() => requestAnimationFrame(render), 1000 / 24 );
    
  // Hook for world events
  app.world.render()
  
  app.renderer.render(app.scene, app.camera)
}

