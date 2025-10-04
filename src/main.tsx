import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Runtime React:', React.version)

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
