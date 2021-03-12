import "./App.css";
import Login from "./routes/Login";
import Home from "./routes/Home";
import Shop from "./routes/Shop";
import Items from "./routes/Items";
import Users from "./routes/Users";
import NewList from './routes/NewList'
import React, { useRef, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import axios from "axios";

export const SessionContext = React.createContext();

function App() {
  const API_INET = "127.0.0.1"
  const API_PORT = 1234
  const API_EVENTS_PORT = 1235
  const API_EVENTS_PATH = '/'
  const API_AUTH_PORT = 1236
  const API_MAX_FAILS = 5
  let apiFails = 0

  //const u = ['Thomas', 'Berga', 'Stefano']
  //u[Math.floor(Math.random() * u.length)])
  const [username, setUsername] = useState(null)

  const API_AUTH = useRef(axios.create({
      baseURL: `http://${API_INET}:${API_AUTH_PORT}`,
    })
  )
  const API = useRef(axios.create({
    baseURL: `http://${API_INET}:${API_PORT}`,
    headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
  }))
  API.current.interceptors.response.use(res => {
    apiFails = 0
    return res
  }, err => {
    apiFails++
    if(apiFails > API_MAX_FAILS)
      alert('API error')
    else {
      const status = err.response ? err.response.status : null
      if (status === 401 || status === 403) {
        return refreshTokens().then(_ => {
          err.config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
          return API.current.request(err.config)
        })
      }
      else
        return Promise.reject(err)
    }
  })

  const setupTokens = (username, password) =>
    API_AUTH.current.post("/login", { username, password })
        .then(res => {
          if (res.status === 200) {
            setUsername(username)
            setTokens(res.data.accessToken, res.data.refreshToken)
          } else alert("Credenziali errate");
        })
        .catch(err => alert("Credenziali errate"))

  const refreshTokens = _ => 
    API_AUTH.current.post('/refreshtoken', { token: localStorage.getItem('refreshtoken') })
      .then(res => setTokens(res.data.accessToken))

  const setTokens = (access, refresh = null) => {
    localStorage.setItem('token', access)
    API.current.defaults.headers.common['Authorization'] = `Bearer ${access}`
    if(refresh) localStorage.setItem('refreshtoken', refresh)
  }

  return (
    <Router>
      <Switch>
        <SessionContext.Provider
          value={{
            API_INET,
            API_PORT,
            API_AUTH_PORT,
            API_EVENTS_PORT,
            API_EVENTS_PATH,
            API,
            username,
            setupTokens
          }}
        >
          { !username && <Login/> }
          { username && (
            <>
              <Route exact path="/edit/items" component={Items} />
              <Route exact path="/edit/users" component={Users} />
              <Route exact path="/shop/:id" component={Shop} />
              <Route exact path="/create/list" component={NewList} />
              <Route exact path="/" component={Home} />
            </>
          )}
        </SessionContext.Provider>{" "}
      </Switch>{" "}
    </Router>
  );
}

export default App;
