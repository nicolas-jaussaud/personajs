import { useEffect, useState } from 'react'
import { app } from '../../core/app'

const Controls = () => {

  const [keyboard, setKeyboard] = useState(app.keyboard ? app.keyboard : 'qwerty')

  useEffect(() => app.keyboard = keyboard, [keyboard])

  const moveKeys = keyboard === 'qwerty' ? 'WASD' : 'ZQSD'
  const cameraKeys = keyboard === 'qwerty' ? 'QE' : 'AE'

  return(
    <>
      <div className='interafce-row'>
      <div className='interafce-row'>
        <label>Gamepad layout</label>
        <i>Gamepad is supported but not documented</i>
      </div>
        <label>Keyboard layout</label>
        <select value={ keyboard } onChange={ e => setKeyboard(e.target.value) }>
          <option value="qwerty">qwerty</option>
          <option value="azerty">azerty</option>
        </select>
      </div>
      <div className='interafce-row'>
        <strong>Move</strong>
        <span>{ moveKeys } (or arrows)</span>
      </div>
      <div className='interafce-row'>
        <strong>Rotate camera</strong>
        <span>{ cameraKeys } (or  ⇓ ⇑)</span>
      </div>
      <div className='interafce-row'>
        <strong>Jump</strong>
        <span>Spacebar</span>
      </div>
      <hr />
    </>
  )
}

export { Controls as default }
