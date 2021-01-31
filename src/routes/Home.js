import React, { useState, useEffect, useContext } from 'react'
import Navbar from '../components/Navbar'
import { SessionContext } from '../App'
import Collapsible from '../components/Collapsible'
import axios from 'axios'
//import cookies from 'axios-cookiejar-support'
//import tough from 'tough-cookie'
import { Link } from 'react-router-dom'

export default function Home() {

    const session = useContext(SessionContext)
    const [lists, setLists] = useState([])

    //cookies(axios)
    axios.defaults.baseURL = session.proxy
    //axios.defaults.jar = new tough.CookieJar()
    //axios.defaults.withCredentials = true/**/

    useEffect(() => {
        axios.get('/user_lists?username='+session.username).then(res => { if(res) setLists(res.data??[]) }).catch((error => console.log('Error fetching lists', error??'')))
    }, [session.username])

    return (
        <>
            <Navbar />
            <Collapsible header="Liste attive" isopen={false}>
                { lists.map(list => <Link to={`/shop/${list.id}`} key={list.id}>{list.nome}</Link>) }
            </Collapsible>
            <Collapsible header="Operazioni">
                <Link to="/crete/list">Crea una nuova lista</Link>
                <Link to="/edit/items">Gestione oggetti e supermercati</Link>
                <Link to="/edit/users">Gestione utenze</Link>
            </Collapsible>
        </>
    )
}
