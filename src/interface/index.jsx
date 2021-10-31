import { render } from 'react-dom'

import Interface from './components/Interface'

const d = document

export const init = () => {

  const interfaceContainer = d.getElementById('interface') 

  render(<Interface/>, interfaceContainer)
} 
