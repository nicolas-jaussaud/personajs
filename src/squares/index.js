import { app } from '../core/app'
import { init as initBuildings } from './building'
import { init as initParks } from './park'

const roadWidth = 30

/**
 * Register square type
 */
const init = () => app.squareLoaderReady = () => {

  // First square will be only floor 
  app.squareLoader.firstSquareType = 'empty'
  app.squareLoader.registerSquareType('empty', 0, squareFloor)

  app.squareLoader.registerSquareType('buildings', 4, initBuildings)

  app.squareLoader.registerSquareType('park', 1, initParks)  
}

/**
 * All our square will use the same floor
 */
const squareFloor = (coordinates, loadedCallback) => {

  const squareSize = app.squareLoader.squareSize

  // White band of the road
  addPlaneGeometry( squareSize, coordinates, 0xFFFFFF, 0 )
  
  // Road
  const roadSize = squareSize - (roadWidth * 0.01)
  addPlaneGeometry( roadSize, coordinates, 0x555555, 1 )

  // Lawn
  const lawnSize = squareSize - (roadWidth / 2)
  addPlaneGeometry( lawnSize, coordinates, 0x55FF66, 2 )
  
  loadedCallback()
}

const addPlaneGeometry = (size, coordinates, color, zIndex) => {

  const geometry  = new THREE.PlaneGeometry( size, size )
  const material  = new THREE.MeshPhongMaterial( {color: color } )
  const mesh      = new THREE.Mesh( geometry, material )
  
  mesh.position.x = (coordinates.x[1] + coordinates.x[0]) / 2
  mesh.position.z = (coordinates.z[1] + coordinates.z[0]) / 2
  mesh.position.y = 0 + (zIndex / 100)

  mesh.rotation.x = - Math.PI / 2
  
  app.scene.add(mesh)
}

export {
  init,
  roadWidth,
  squareFloor
}
