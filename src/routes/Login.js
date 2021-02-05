import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { SessionContext } from '../App'
import { Formik } from 'formik'
import './css/Login.css'
import axios from 'axios'
//import cookies from 'axios-cookiejar-support'
//import tough from 'tough-cookie'

export default function Login() {

    const session = useContext(SessionContext)
    const history = useHistory()

    //cookies(axios)
    axios.defaults.baseURL = session.proxy
    //axios.defaults.jar = new tough.CookieJar()
    //axios.defaults.withCredentials = true

    return (
        <Formik
            initialValues={{ username: '', password: '' }}
            validate={values => {
                const errors = {};
                if (!values.username) errors.username = 'Required';
                if (!values.password) errors.password = 'Required';
                return errors;
            }}
            onSubmit={({ username, password }) => {
                axios.post('/', { username, password }).then(res => {
                    if(res.status === 200) {
                        session.setUsername(username)
                        history.push('/home')
                    }
                }).catch(err => console.log(err))
            }}
        >
            {({ values, errors, isSubmitting, handleChange, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                    <img id="logo" src="logo.svg" alt="Spesa" />
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" name="username" value={values.username} onChange={handleChange} />
                    {errors.username && <p className="error">{errors.username}</p>}
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" name="password" value={values.password} onChange={handleChange} />
                    {errors.password && <p className="error">{errors.password}</p>}
                    <button type="submit" disabled={errors.password || errors.username}>Login</button>
                </form>
            )}
        </Formik>
    )
}
