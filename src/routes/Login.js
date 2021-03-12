import React, { useContext } from 'react'
import { SessionContext } from '../App'
import { Formik } from 'formik'
import './css/Login.css'

export default function Login() {

    const session = useContext(SessionContext)
    return (
        <Formik
            initialValues={{ username: '', password: '' }}
            validate={values => {
                const errors = {}
                if (!values.username) errors.username = 'Required';
                if (!values.password) errors.password = 'Required';
                return errors;
            }}
            onSubmit={({ username, password }) => session.setupTokens(username, password)}
        >
            {({ values, errors, handleChange, handleSubmit }) => (
                <form className="login" onSubmit={handleSubmit}>
                    <img id="logo" src="/logo.svg" alt="Spesa" />
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
