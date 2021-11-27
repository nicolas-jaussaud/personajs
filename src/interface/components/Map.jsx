import { useState } from 'react'
import { app } from '../../core/app'

const Map = ({
  width,
  height 
}) => {
  
  const [higherValues, setHigherValues] = useState({ x: [0, 0], y: [0, 0] })
  const [mapSize, setMapSize] = useState(0)
  const [squareSize, setSquareSize] = useState(false)
  const [squares, setSquares] = useState([])

  /**
   * Will be a hook in the future
   */
  app.newSquareLoaded = newSquare => {

    const newHigherValues = higherValues 
      
    if( newHigherValues.x[0] > newSquare.position.x[0] ) newHigherValues.x[0] = newSquare.position.x[0]
    if( newHigherValues.x[1] < newSquare.position.x[1] ) newHigherValues.x[1] = newSquare.position.x[1]
    if( newHigherValues.y[0] > newSquare.position.y[0] ) newHigherValues.y[0] = newSquare.position.y[0]
    if( newHigherValues.y[1] < newSquare.position.y[1] ) newHigherValues.y[1] = newSquare.position.y[1]

    setSquareSize(app.squareLoader.squareSize)

    setHigherValues(newHigherValues)

    setMapSize(Math.max(
      Math.abs(newHigherValues.x[0]),
      Math.abs(newHigherValues.x[1]),
      Math.abs(newHigherValues.y[0]),
      Math.abs(newHigherValues.y[1])
    ))

    setSquares([ ...squares, newSquare ])
  }

  if( !squareSize ) return <></>;

  const unitSize = 100 / (mapSize * 2)
  const mapSquareSize = unitSize * squareSize
  
  console.log(mapSize, unitSize, mapSquareSize)
  return(
    <div className='interface-map' style={{ width: width, height: height }}>
      { squares.map(square => {

        const top = (square.position.y[0] + mapSize) * unitSize
        const left = (square.position.x[0] + mapSize) * unitSize

        return(
          <span 
            key={ square.position.y[0] + '_' + square.position.x[0] } 
            className='interface-map-square'
            style={{ 
              width: mapSquareSize + '%', 
              height: mapSquareSize + '%',
              top: top + '%',
              left: left + '%'
            }}
          ></span>
        )
        
      }) }
    </div>
  )
}

export { Map as default }
