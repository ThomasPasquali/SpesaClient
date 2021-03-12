import IO from 'socket.io-client'

import React, { useEffect, useState, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'

import { SessionContext } from '../App'
import Footer from '../components/Footer'
import Collapsible from '../components/Collapsible'
import Navbar from '../components/Navbar'

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete from '@material-ui/lab/Autocomplete';

import './css/ItemsAndRecipes.css'

export default function Spesa() {

    const { id } = useParams()
    const { API, API_INET, API_EVENTS_PORT, API_EVENTS_PATH, username } = useContext(SessionContext)
    const [list, setList] = useState({ id: '', nome: '' })
    const [items, setItems] = useState([])
    const io = useRef(null)
    const [addingItem, setAddingItem] = useState(false);
    //TODO change it into an object
    const [shopItems, setShopItems] = useState()

    const itemComparator = (i1, i2) => i1.nome.localeCompare(i2.nome)
    
    const fetchItems = () => {
        console.log('Fetching list...')
        API.current.get(`/list?listid=${id}`)
            .then(res => { setList(res.data ?? {}); console.log('List fetched!') })

        console.log('Fetching list items...')
        API.current.get(`/list_items?listid=${id}`)
            .then(res => {
                setItems(res.data.sort(itemComparator))
                console.log('List items fetched!')
            })

        console.log('Fetching shop items...')
        API.current.get(`/shop_items?shopid=${list.supermercatoID}`)
            .then(res => {
                setShopItems(res.data)
                console.log('Shop items fetched!')
            })
    }

    /********LODING FROM API********/
    useEffect(fetchItems, [id, list.supermercatoID, API])

    /*************LISTEN TO EVENTS************/
    useEffect(() => {
        if (io.current) return;

        io.current = IO(`http://${API_INET}:${API_EVENTS_PORT}`, {
            path: API_EVENTS_PATH,
            reconnectionDelayMax: 10000,
            query: {
                username: username,
            }
        });
        console.log('Connecting to events...')
        io.current.on('connect', () => console.log('Listening for events...'))

        io.current.onAny((event, ...args) => console.log(`Got event ${event} with values `, args))

        //TODO Event emitting based on active list
        io.current.on('item_bought', values => {
            if (values.listid === parseInt(id))
                setItems(items => items.map(item =>
                    item.id === values.itemid
                        ? { ...item, acquirente: values.buyer }
                        : item
                ))
        })
        io.current.on('item_quantity_updated', values => {
            if (values.listid === parseInt(id))
                setItems(items => items.map(item =>
                    item.id === values.item.id
                        ? { ...item, quantita: values.item.quantita }
                        : item
                ))
        })
        io.current.on('new_list_item', values => {
            if (values.listid === parseInt(id))
                setItems(items => [...items, values.item])
        })
        io.current.on('removed_list_item', values => {
            let listid = parseInt(values.listid)
            let itemid = parseInt(values.itemid)
            if (listid === parseInt(id))
                setItems(items => items.filter(item => item.id !== itemid))
    })
        
    }, [id, API_EVENTS_PATH, API_EVENTS_PORT, API_INET, username])

    const buy = event => {
        event.preventDefault()
        const elem = event.target
        const itemid = parseInt(elem.id)
        let buyer = elem.checked ? username : null
        //FIXME price
        API.current.patch('/buyer_list_item', { listid: list.id, itemid, buyer, price: null }).catch(err => {
            console.log(err)
            alert('Impossibile acquistare l\'oggetto')
        })
    }

    const getTitle = list => `${list.nome} (#${list.id}, ${list.supermercato})`
    const getItemDescription = item => (
        <>
            <p>{item.nome}{item.acquirente ? ` (${item.acquirente})` : ''}</p>
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
                            <p onClick={() =>removeItemFromList(item)}>🗑️</p>
                        </div>
                    ))
                }
            </div>
        )
    }

    let itemToAddid, itemToAddqty = 1

    const addItemToList = () => {
        if (itemToAddid)
            API.current.put(`/list_item`, { listid: list.id, itemid: itemToAddid, quantity: itemToAddqty })
        closeDialog()
    }

    const closeDialog = () => {
        setAddingItem(false)
        itemToAddid = null
        itemToAddqty = 1
    }

    const removeItemFromList = item => API.current.delete(`/list_item?listid=${list.id}&itemid=${item.id}`)

    return (
        <>
            <Navbar title={getTitle(list)} />
            <Collapsible header="Da acquistare">{getItemsList(items.filter(item => !item.acquirente))}</Collapsible>
            <Collapsible header="Acquistati">{getItemsList(items.filter(item => item.acquirente))}</Collapsible>

            <Dialog open={addingItem} onClose={closeDialog} fullWidth={true}>
                <DialogTitle id="form-dialog-title">Aggiungi oggetto</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={shopItems}
                        style={{ marginBottom: 15 }}
                        onChange={(e, val) => { if (val) itemToAddid = val.id }}
                        getOptionLabel={item => `${item.nome} (${item.note})`}
                        renderInput={(params) => <TextField {...params} label="Oggetto" variant="outlined" />}
                    />
                    <TextField label="Quantità" type="number" fullWidth defaultValue="1" onChange={e => itemToAddqty = e.target.value} />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={closeDialog} >Annulla</Button>
                    <Button color="primary" variant="outlined" onClick={addItemToList}>AGGIUNGI</Button>
                </DialogActions>
            </Dialog>

            <Footer>
                <img onClick={() => setAddingItem(true)} src="/add-to-cart.svg" alt="Aggiungi oggetto" />
            </Footer>
        </>
    )
}
