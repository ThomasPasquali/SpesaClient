import React, { useState, useEffect, useContext } from 'react'
import Navbar from '../components/Navbar'
import { SessionContext } from '../App'
import Collapsible from '../components/Collapsible'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

import './css/Home.css'

const useStyles = makeStyles({
  root: {
    color: 'var(--color)',
    fontWeight: 'bold',
    borderColor: 'var(--color)'
  },
})

export default function Home() {

    const classes = useStyles()
    const btnProps = {
        fullWidth: true,
        variant: 'outlined',
        className: classes.root,
    }

    const { username, API } = useContext(SessionContext)
    const [lists, setLists] = useState([])
    
    useEffect(() => {
        API.current.get('/user_lists?username='+username)
            .then(res => { if(res) setLists(res.data??[]) })
            .catch((error => console.log('Error fetching lists', error??'')))
    }, [API, username])

    return (
        <>
            <Navbar />
            <Collapsible header="Operazioni" isopen={true} className='list'>
                <Link to="/create/list">
                    <Button {...btnProps} >Nuova lista</Button>
                </Link>
                <Link to="/edit/items" className={classes.root}>
                    <Button {...btnProps} >Gestione oggetti e supermercati</Button>
                </Link>
                <Link to="/edit/recipes" className={classes.root}>
                    <Button {...btnProps} >Gestione ricette</Button>
                </Link>
                <Link to="/edit/users" className={classes.root}>
                    <Button {...btnProps} >Gestione utenze WIP</Button>
                </Link>
            </Collapsible>
            <Collapsible header="Liste attive" className='list'>
                { lists.length === 0 && <p>Nessuna lista attiva</p> }
                { 
                    lists.map(list => 
                        <Link className={classes.root} to={`/shop/${list.id}`} key={list.id}>
                            <Button {...btnProps} >{list.nome}</Button>
                        </Link>
                    )
                }
            </Collapsible>
        </>
    )
}
