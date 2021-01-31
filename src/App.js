import './App.css'
import Root from './routes/Root'
import Login from './routes/Login'
import Home from './routes/Home'
import Shop from './routes/Shop'
import React, { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

export const SessionContext = React.createContext()

function App() {

  const [username, setUsername] = useState('Thomas')

  return (

    <Router>
      <Switch>
        <SessionContext.Provider value={{
          proxy: 'http://127.0.0.1:1234',
          username,
          setUsername
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
