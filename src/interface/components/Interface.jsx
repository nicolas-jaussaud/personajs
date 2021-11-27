import { useState } from 'react'

import Controls from './Controls'
import About from './About'
import Map from './Map'

const Interface = () => {

  const [section, openSection] = useState(false)

  const toggleSection = sectionName => section !== sectionName 
    ? openSection(sectionName)
    : openSection(false)

  return(
    <div className='interface-container'>
      <nav className='interface-menu'>
        <li onClick={ () => toggleSection('controls') }> &#9965; Controls</li>
        <li onClick={ () => toggleSection('about') }>&#128712; About</li>
      </nav>

      { section !== false ?
        <div className='interface-content-container'>
          <span className='interface-content-close' onClick={ () => openSection(false) }>&#9932;</span>
          <div className="interface-content-text">
            <h2>{ section === 'controls' ? 'Controls' : 'About' }</h2>
            { section === 'controls' 
              ? <Controls />
              : <About /> }
          </div>
        </div>
        : ''}

        <div className='interface-content-map'>
          <Map width={ 200 } height={ 200 } />
        </div>
    </div>
  )
}

export { Interface as default }
