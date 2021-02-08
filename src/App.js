import './App.css'
import Login from './routes/Login'
import Home from './routes/Home'
import Shop from './routes/Shop'
import Items from './routes/Items'
import Users from './routes/Users'
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
          events: {
            port: 1235,
            path: '/'
          }
        }}>
          <Route exact path="/login" component={Login} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/edit/items" component={Items} />
          <Route exact path="/edit/users" component={Users} />
          <Route exact path="/shop/:id" component={Shop} />
          <Route exact path="/" component={username?Home:Login} />
        </SessionContext.Provider>
      </Switch>
    </Router>

  )
}

export default App;
