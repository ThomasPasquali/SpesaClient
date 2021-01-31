import session from 'express-session'
import React, { useContext } from 'react'
import { SessionContext } from '../App'
import './css/Navbar.css'

export default function Navbar({ title }) {
    /* eslint-disable no-unused-vars */
    // eslint-disable-line no-unused-vars
    const session = useContext(SessionContext)

    const getSaluto = () => {
        const hour_of_day = new Date().getHours()
        return  ((hour_of_day > 22 || hour_of_day <= 5) ? "Buona notte e sogni d'oro" :
                (hour_of_day > 5 && hour_of_day <= 11) ? 'Buon giorno' :
                (hour_of_day > 11 && hour_of_day <= 17) ? 'Buon pomeriggio' : 'Buona sera');
    }
    
    // eslint-disable-line no-unused-vars
    return (
        <nav>
            <img src="/logo.svg" alt="Spesa" />
            <h1>{title??(getSaluto()+session.username)}</h1>
            <button>Logout</button>
        </nav>
    )
    /* eslint-enable no-unused-vars */
}
