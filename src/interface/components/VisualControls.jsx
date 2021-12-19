/**
 * Implement visual controls for mobile mostly
 */

const VisualControls = () => {

  const keyDown = keyCode => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        keyCode: keyCode,
        which: keyCode
      })
    )
  }

  const keyUp = keyCode => {
    document.dispatchEvent(
      new KeyboardEvent('keyup', {
        keyCode: keyCode,
        which: keyCode
      })
    )
  }
  
  return(
    <div className='interface-visual-controls'>

      <div className='interface-visual-controls-row'>
        <div className='interface-visual-controls-key' onTouchStart={ () => keyDown(33) } onTouchEnd={ () => keyUp(33) }>↶</div>
        <div className='interface-visual-controls-key' onTouchStart={ () => keyDown(38) } onTouchEnd={ () => keyUp(38) }>↑</div>
        <div className='interface-visual-controls-key' onTouchStart={ () => keyDown(34) } onTouchEnd={ () => keyUp(34) }>↷</div>
      </div>

      <div className='interface-visual-controls-row'>
        <div className='interface-visual-controls-key' onTouchStart={ () => keyDown(37) } onTouchEnd={ () => keyUp(37) }>←</div>
        <div className='interface-visual-controls-key' onTouchStart={ () => keyDown(40) } onTouchEnd={ () => keyUp(40) }>↓</div>
        <div className='interface-visual-controls-key' onTouchStart={ () => keyDown(39) } onTouchEnd={ () => keyUp(39) }>→</div>
      </div>

      <div className='interface-visual-controls-row'>
        <div className='interface-visual-controls-key'  onTouchStart={ () => keyDown(32) } onTouchEnd={ () => keyUp(32) } style={{ fontSize: '3vw' }}>Space bar</div>
      </div>

    </div>
  )
}

export { VisualControls as default }
