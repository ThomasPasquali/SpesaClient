import './App.css'
import Root from './routes/Root'
import Login from './routes/Login'
import Home from './routes/Home'
import Shop from './routes/Shop'
import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

export const SessionContext = React.createContext()

function App() {

  const u = ['Thomas', 'Berga', 'Stefano']
  const [username, setUsername] = useState(u[Math.floor(Math.random() * u.length)])
  const apiInet = '127.0.0.1'

  return (

    <Router>
      <Switch>
        <SessionContext.Provider value={{
          apiInet,
          proxy: `http://${apiInet}:1234`,
          username,
          setUsername,
          groups: [1, 2],
          events: {
            port: 1235,
            path: '/'
          }
        }}>
          <Route exact path="/login" component={Login} />
          <Route exact path="/home" component={Home} />
          <Route path="/shop/:id" component={Shop} />
          <Route path="/" component={Root} />
        </SessionContext.Provider>
      </Switch>
    </Router>

  )
}

export default App;
