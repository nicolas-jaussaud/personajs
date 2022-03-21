import World from './classes/World'

import { render } from './render'

import { init as initLoaders } from './import/'
import { init as initControls } from './controls/'
import { init as initDebugStats } from './debug.js'

import { app } from './app'

export const init = selector => {

  if( app.debug ) initDebugStats()

  app.element = document.querySelector(selector)

  app.renderer = new THREE.WebGLRenderer()
  app.renderer.setSize(window.innerWidth, window.innerHeight)
  
  app.renderer.gammaOutput = true
  app.renderer.antialias = true
  
  app.scene   = new THREE.Scene()
  app.camera  = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000)
  app.clock   = new THREE.Clock()

  app.element.appendChild(app.renderer.domElement)

  initLoaders()

  app.world = new World()

  initControls()

  render()
  
} 

/**
 * Support window resize
 * 
 * @see https://stackoverflow.com/a/20434960
 */
window.addEventListener('resize', () => {

  app.camera.aspect = window.innerWidth / window.innerHeight
  app.camera.updateProjectionMatrix()

  app.renderer.setSize( window.innerWidth, window.innerHeight )
  
})
