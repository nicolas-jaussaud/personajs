import { app } from '../core/app'
import { squareFloor, roadWidth }  from './'

const threesPerSquare = 10

const init = (coordinates, loadedCallback) => {
  
  loadTreesFile(() => {
    for (let i = 0; i < threesPerSquare; i++) addRandomTree(coordinates)
  })
  
  squareFloor(coordinates, loadedCallback)
}

/**
 * Load FBX files for trees
 */
const loadTreesFile = callback => {

  const loaded = []
  const fileNumber = 8

  for (let i = 0; i < fileNumber; i++) {
    
    const fileName = 'trees/forest' + (i + 1) + '.fbx'
    
    app.load(fileName, object => {
      loaded.push(object)
      loaded.length === fileNumber ? callback() : null
    })
  }
}

/**
 * Create random trees in the square
 */
const addRandomTree = coordinates => {

  const treeNumber = Math.random() * (8 - 1) + 1
  const fileName = 'trees/forest' + (parseInt(treeNumber) + 1) + '.fbx'
  
  const tree = app.objects[ fileName ].clone()
  
  tree.scale.set(0.004,0.004,0.004)
  
  setTreePosition(tree, coordinates)    
}

const setTreePosition =(object, coordinates) => {
    
  app.scene.add(object)

  // We don't wan to add anything on the road
  const innerSquare = {
    x: [
      coordinates.x[0] + (roadWidth / 2), 
      coordinates.x[1] - (roadWidth / 2) 
    ],
    z: [
      coordinates.z[0] + (roadWidth / 2), 
      coordinates.z[1] - (roadWidth / 2) 
    ]
  }

  /**
   * @see https://stackoverflow.com/a/67746339/10491705
   */
  const positionX = Math.floor(Math.random() * (innerSquare.x[1] - innerSquare.x[0] + 1)) + innerSquare.x[0]
  const positionZ = Math.floor(Math.random() * (innerSquare.z[1] - innerSquare.z[0] + 1)) + innerSquare.z[0]

  object.position.x = positionX 
  object.position.z = positionZ 
  object.position.y = -0.2

  /**
   * This part is probably not needed anymore, as long as square will be loaded without 
   * the user in it in all the cases
   */

  const world = app.world
  const isCollision = world.isCollision(object)

  isCollision
    ? app.scene.remove(object.name)
    : world.worldObjects.push(object)

  // Check if collision with character (should find a better way to do this)
  if( world.isCollision(world.character().object) ) {
    app.scene.remove(object.name)
    world.worldObjects.pop(object)
  }
}

export { init }
