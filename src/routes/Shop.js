import axios from 'axios'
import React, { useEffect, useState, useContext } from 'react'
import { SessionContext } from '../App'
import { useParams } from 'react-router-dom'
import Collapsible from '../components/Collapsible'
import Navbar from '../components/Navbar'
import './css/Shop.css'

export default function Spesa() {

    const { id } = useParams()
    const session = useContext(SessionContext)
    const [list, setList] = useState({ id: '', nome: '', supermercato: '' })
    const [itemsBought, setItemsBought] = useState([])
    const [itemsToBuy, setItemsToBuy] = useState([])
    const [error, setError] = useState(null)

    const itemComparator = (i1, i2) => i1.nome.localeCompare(i2)
    const handleError = (e, message) => {
        console.log(e)
        setError(message)
    }
    const fetchItems = () => {
        axios.get(`/list?id=${id}`)
            .then(res => setList(res.data ?? {}))
            .catch((e => handleError(e, 'Error fetching list data')))

        axios.get(`/list_items?id=${id}`)
            .then(res => {
                let bought = [], toBuy = []
                res.data.forEach(item => (item.acquirente ? bought : toBuy).push(item))
                setItemsBought(bought.sort(itemComparator))
                setItemsToBuy(toBuy.sort(itemComparator))
                console.log('Done!');
            })
            .catch((e => handleError(e, 'Error fetching list items')))
    }

    /********LODING FROM API********/
    useEffect(fetchItems, [id])

    const buy = event => {
        event.preventDefault()
        const elem = event.target
        const itemid = parseInt(elem.id)
        let buyer = elem.checked ? session.username : null
        //FIXME price and performances
        axios.patch('/list_item', { listid: list.id, itemid, buyer, price: null })
            .then(() => fetchItems()).catch(err => {
                console.log(err)
                alert('Impossibile acquistare l\'oggetto')
            })
    }

    const getTitle = list => `${list.nome} (#${list.id}, ${list.supermercato})`
    const getItemDescription = item => (
        <>
            <p>{item.nome}</p>
            <p>{item.note ? `(${item.note})` : ''}</p>
            <p>{item.quantita} pz.</p>
        </>
    )
    const getItemsList = items => {
        return (
            <div className="items">
                {
                    items.map(item => (
                        <div className="item" key={item.id}>
                            <input id={item.id} type="checkbox" onChange={buy} checked={item.acquirente ? 'checked' : ''} />
                            <label htmlFor={item.id}>{getItemDescription(item)}</label>
                        </div>
                    ))
                }
            </div>
        )
    }

    return (
        <>
            { error && <div className="error-box">{error}</div>}
            { !error && (
                <>
                    <Navbar title={getTitle(list)} />
                    <Collapsible header="Da acquistare">{getItemsList(itemsToBuy)}</Collapsible>
                    <Collapsible header="Acquistati">{getItemsList(itemsBought)}</Collapsible>
                </>
            )}
        </>
    )
}
