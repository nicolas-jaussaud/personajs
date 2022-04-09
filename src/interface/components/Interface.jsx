import { app } from '../../core/app'
import { useState } from 'react'

import Controls from './Controls'
import About from './About'
import Map from './Map'
import VisualControls from './VisualControls'

const Interface = () => {

  const [section, openSection] = useState(false)  
  
  const [isLoading, setIsLoading] = useState(true)  
  const [isDead, setIsDead] = useState(false)

  app.worldLoaded  = () => setIsLoading(false)
  app.deadCallback = () => setIsDead(true)

  const isMobile = 'ontouchstart' in document.documentElement

  const toggleSection = sectionName => section !== sectionName 
    ? openSection(sectionName)
    : openSection(false)

  return(
    <div className='interface-container'>
      
      { isLoading &&
        <div className='interface-loading interface-container'>
          <div className='interface-loading-text'>Loading...</div>
        </div>
      }

      { isDead &&
        <div className='interface-loading interface-container'>
          <div className='interface-loading-text'>Game over</div>
        </div>
      }

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

        { isMobile && <VisualControls /> }

    </div>
  )
}

export { Interface as default }
