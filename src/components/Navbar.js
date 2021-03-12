import React, { useContext } from 'react'
import { SessionContext } from '../App'
import { Link } from 'react-router-dom'
import './css/Navbar.css'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import ShoppingCartOutlinedIcon from '@material-ui/icons/ShoppingCartOutlined'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    color: 'var(--secondary)',
    fontSize: '2rem'
  },
})

export default function Navbar({ title }) {
    const session = useContext(SessionContext)
    const classes = useStyles()

    const getSaluto = () => {
        const hour_of_day = new Date().getHours()
        return ((hour_of_day > 22 || hour_of_day <= 5) ? "Buona notte e sogni d'oro" :
            (hour_of_day > 5 && hour_of_day <= 11) ? 'Buongiorno' :
                (hour_of_day > 11 && hour_of_day <= 17) ? 'Buon pomeriggio' : 'Buona sera');
    }

    return (
        <nav>
            <Link to="/">
                <ShoppingCartOutlinedIcon className={classes.root}/>
            </Link>
            <h1>{title ?? (getSaluto() + ' ' + session.username)}</h1>
            <ExitToAppIcon className={classes.root}/>
        </nav>
    )
}
