import { render } from 'react'

const d = document

const init = () => {

  const interfaceContainer = d.getElementById('interface') 

  render(<div>Salut</div>, interfaceContainer)
}
