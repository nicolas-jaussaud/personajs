import { app } from '../core/app'
import { squareFloor }  from './'

const init = coordinates => {

  squareFloor(coordinates)

  loadBuildingsFile(() => addRandomBuilding(coordinates))
}

/**
 * Load FBX files for buildings
 */
const loadBuildingsFile = callback => {

  const loaded = []
  const fileName = 'buildings/buildings.fbx'
    
  app.load(fileName, object => {
    loaded.push(object) 
    callback()
  })
}

const addRandomBuilding = coordinates => {
      
  const fileName = 'buildings/buildings.fbx'
  const buildings = app.objects[ fileName ].clone()

  const buildingNumber = Math.random() * (buildings.children.length - 1) + 1
  const building = buildings.children[ parseInt(buildingNumber) ] 

  building.scale.set(0.1, 0.1, 0.1)
  
  setCenterPosition(building, coordinates)   
}
  

const setCenterPosition = (object, coordinates) => {

  app.scene.add(object)

  const squareSize = app.squareLoader.squareSize

  object.position.x = coordinates.x[1] - (squareSize / 2) 
  object.position.z = coordinates.z[1] - (squareSize / 2) 
  object.position.y = -0.2

  app.world.worldObjects.push(object)
}

export { init }
