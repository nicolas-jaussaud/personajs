import { app } from '../app'

export default class SquareLoader {

  constructor() {

    this.squareSize = 60
    this.squareVisibility = 2
    this.loadedSquare = []

    this.firstSquareType = false
    this.squareTypes = {}
    this.priorityKeys = {}
  }

  init() { 

    if( app.squareLoaderReady ) app.squareLoaderReady()

    // First square
    this.loadSquareMap({
      x: [-(this.squareSize / 2), this.squareSize / 2],
      z: [-(this.squareSize / 2), this.squareSize / 2]
    }, true)

    // Check if we need to load more square according to user position 

    setInterval(() => this.shouldLoadSquare(), 500)
  }

  /**
   * Register a new square type, a square with lower priority will
   * have less chance to be displayed
   */
  registerSquareType = (name, priority, callback) => {
    
    this.squareTypes[ name ] = {
      callback: callback,
      priority: priority
    }

    this.refreshPriorityKeys()
  } 

  loadSquareType = (name, loadedKey, coordinates) => {
    
    this.loadedSquare[ loadedKey ] = {
      type: name,
      position: {
        x: [ coordinates.x[0], coordinates.x[1] ],
        y: [ coordinates.z[0], coordinates.z[1] ]
      }
    }

    if( app.newSquareLoaded ) app.newSquareLoaded(this.loadedSquare[ loadedKey ])

    return this.squareTypes[ name ] 
      ? this.squareTypes[ name ].callback( coordinates ) 
      : false
  }

  /**
   * Array that will allow us to quicly get square according to priority
   * 
   * There might be a more elegent way to handle this but it works
   */
  refreshPriorityKeys = () => {
    
    const keys = []
    
    for( const type in this.squareTypes ) {
      for( let i = 0; i < this.squareTypes[ type ].priority; i++)  keys.push(type)
    }

    this.priorityKeys = keys
  }

  loadSquareMap(coordinates, firstSquare =  false) {

    // We don't want to reload this square
    const loadedKey = coordinates.x[0] + '-' + coordinates.x[1] + '-' + coordinates.z[0] + '-' + coordinates.z[1]
    
    if( this.loadedSquare[ loadedKey ] ) return;
    
    // First square has to be empty + init cars
    if( firstSquare && this.firstSquareType ) {
      this.loadSquareType(this.firstSquareType, loadedKey, coordinates)
      return;
    } 

    const randomIndex = Math.floor(Math.random() * this.priorityKeys.length)
    const randomSquareType = this.priorityKeys[ randomIndex ]

    this.loadSquareType(randomSquareType, loadedKey, coordinates)

    console.info('New square loaded: ' + coordinates.x[0] + ' ' + coordinates.x[1] + ' ' + coordinates.z[0] + ' ' + coordinates.z[1])
  }

  squareExists(x, z) {

    const square = this.getSquare(x, z)

    const loadedKey = square.lowX + '-' + square.upX + '-' + square.lowZ + '-' + square.upZ

    return this.loadedSquare[ loadedKey ] ? true : false
  }

  getSquare(x, z) {

    const halfSquare = this.squareSize / 2
    const coordinates = {}

    coordinates.lowZ = Math.ceil( (z - halfSquare) / this.squareSize ) * this.squareSize - halfSquare
    coordinates.lowX = Math.ceil( (x - halfSquare) / this.squareSize ) * this.squareSize - halfSquare
    
    coordinates.upX = coordinates.lowX + this.squareSize
    coordinates.upZ = coordinates.lowZ + this.squareSize

    return coordinates
  }

  shouldLoadSquare() {
    
    const character = app.playableCharacter.character
    
    // If character not loaded yet, position will be 0
    const currentX = character !== false ? character.object.position.x : 0
    const currentZ = character !== false ? character.object.position.z : 0
    
    const square = this.getSquare(currentX, currentZ)

    console.info('Current square is: ' + square.lowX + ' ' + square.upX + ' ' + square.lowZ + ' ' + square.upZ)

    /**
     * Load square arround current one in every direction, according to squareVisibility attribute
     */

    for (let i = 0; i < this.squareVisibility; i++) {

      const squareDistance = this.squareSize * (i + 1)

      // Whataever the distance is, we want to load middle square and angle on each side 
      
      // Angles and middle with lower X position 
      this.loadSquareMap({
        x: [square.lowX - squareDistance, square.upX - squareDistance],
        z: [square.lowZ, square.upZ],
      })
      this.loadSquareMap({
        x: [square.lowX - squareDistance, square.upX - squareDistance],
        z: [square.lowZ + squareDistance, square.upZ + squareDistance],
      })
      this.loadSquareMap({
        x: [square.lowX - squareDistance, square.upX - squareDistance],
        z: [square.lowZ - squareDistance, square.upZ - squareDistance],
      })
      
      // Middles with same X position but lower and higer Z 
      this.loadSquareMap({
        x: [square.lowX, square.upX],
        z: [square.lowZ + squareDistance, square.upZ + squareDistance],
      })
      this.loadSquareMap({
        x: [square.lowX, square.upX],
        z: [square.lowZ - squareDistance, square.upZ - squareDistance],
      })
      
      // Angles and middle with upper X position 
      this.loadSquareMap({
        x: [square.lowX + squareDistance, square.upX + squareDistance],
        z: [square.lowZ, square.upZ],
      })
      this.loadSquareMap({
        x: [square.lowX + squareDistance, square.upX + squareDistance],
        z: [square.lowZ + squareDistance, square.upZ + squareDistance],
      })
      this.loadSquareMap({
        x: [square.lowX + squareDistance, square.upX + squareDistance],
        z: [square.lowZ - squareDistance, square.upZ - squareDistance],
      })

      // Then, we load missing squares between middle and angles, unless squareDistance is 1 because everything is already loaded

      if(i === 0) continue;

      for (let k = 0; k < this.squareVisibility; k++) {

        const currentDistance = this.squareSize * (k + 1)
        
        // Between angles and middle, lower X position 
        this.loadSquareMap({
          x: [square.lowX - squareDistance, square.upX - squareDistance],
          z: [square.lowZ + currentDistance, square.upZ + currentDistance],
        })

        this.loadSquareMap({
          x: [square.lowX - squareDistance, square.upX - squareDistance],
          z: [square.lowZ - currentDistance, square.upZ - currentDistance],
        })

        // Between angles and middle, higher X position
        this.loadSquareMap({
          x: [square.lowX + squareDistance, square.upX + squareDistance],
          z: [square.lowZ + currentDistance, square.upZ + currentDistance],
        })

        this.loadSquareMap({
          x: [square.lowX + squareDistance, square.upX + squareDistance],
          z: [square.lowZ - currentDistance, square.upZ - currentDistance],
        })

        // Between angles and middle, lower Z position
        this.loadSquareMap({
          x: [square.lowX - currentDistance, square.upX - currentDistance],
          z: [square.lowZ - squareDistance, square.upZ - squareDistance],
        })
        
        this.loadSquareMap({
          x: [square.lowX + currentDistance, square.upX + currentDistance],
          z: [square.lowZ - squareDistance, square.upZ - squareDistance],
        })

        // Between angles and middle, higher Z position
        this.loadSquareMap({
          x: [square.lowX - currentDistance, square.upX - currentDistance],
          z: [square.lowZ + squareDistance, square.upZ + squareDistance],
        })
        
        this.loadSquareMap({
          x: [square.lowX + currentDistance, square.upX + currentDistance],
          z: [square.lowZ + squareDistance, square.upZ + squareDistance],
        })
      }
    
    }
    
  }

}
