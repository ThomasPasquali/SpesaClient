import axios from 'axios'
import React, { useEffect, useState, useContext, useRef } from 'react'
import { AgGridColumn, AgGridReact } from 'ag-grid-react'
import { SessionContext } from '../App'
import Collapsible from '../components/Collapsible'
import Navbar from '../components/Navbar'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css'
import './css/Items.css'
import Footer from '../components/Footer'

export default function Items() {

    const session = useContext(SessionContext)
    const [shopsItems, setShopsItems] = useState([])
    const gridApis = useRef([])
    const selectedItem = useRef(null)

    const [addingItem, setAddingItem] = useState(false)
    const [removingItem, setRemovingItem] = useState(false)
    let newShop = shopsItems[0] ? shopsItems[0].id : '', newName = '', newNotes = '', newPrice = ''

    const handleError = (e, message) => console.log(message, e)

    useEffect(() => {
        axios.get(`/user_shops?username=${session.username}`).then(async res => {
            let shops = []
            for (let i = 0; i < res.data.length; i++) {
                const shop = res.data[i];
                const items = await axios.get(`/shop_items?shopid=${shop.id}`)
                shop.items = items.data
                shops[shop.id] = shop
            }
            setShopsItems(shops)
        }).catch((e => handleError(e, 'Error fetching shops')))
    }, [session.username])

    const gridReady = (api, shopid) => {
        api.sizeColumnsToFit()
        gridApis.current[shopid] = api
    }

    const cellUpdate = item => axios.put('/item', item.data)

    const cellSelected = item => selectedItem.current = item.data

    const defaultColDef = {
        sortable: true,
        editable: true,
        onCellValueChanged: cellUpdate,
    }

    const NOTaddingItem = () => setAddingItem(false)
    const NOTremovingItem = () => setRemovingItem(false)

    const addItem = () => {
        let item = { id: -1, nome: newName, note: newNotes, prezzo: newPrice, supermercato: newShop }
        axios.put('/item', item).then(res => {
            setShopsItems(shops => {
                shops[res.data.supermercato].items.push(res.data)
                gridApis.current[res.data.supermercato].applyTransaction({
                    add: [res.data],
                    addIndex: 0,
                })
                return shops
            })
            NOTaddingItem()
        }).catch((e => handleError(e, 'Error creating new item')))
    }

    const removeItem = () => {
        const itemid = selectedItem.current.id
        const shopid = selectedItem.current.supermercato
        axios.delete(`/item?itemid=${itemid}`).then(() => {
            setShopsItems(shops => {
                shops[shopid].items = shops[shopid].items.filter(item => item.id !== itemid)
                gridApis.current[shopid].applyTransaction({
                    remove: [selectedItem.current]
                })
                selectedItem.current = null
                return shops
            })
            NOTremovingItem()
        }).catch((e => handleError(e, 'Error removing item', selectedItem.current)))
    }

    console.log('RENDER...', shopsItems);

    return (
        <>
            <Navbar title="Gestione oggetti" />
            {
                shopsItems.map(shop => (
                    <Collapsible header={`${shop.nome} (${shop.citta})`} key={shop.id}>
                        <div className="ag-theme-balham-dark grid">
                            <AgGridReact
                                rowData={shop.items}
                                onGridReady={params => gridReady(params.api, shop.id)}
                                defaultColDef={defaultColDef}
                                onCellClicked={cellSelected}
                            >
                                <AgGridColumn field="id" hide={true}></AgGridColumn>
                                <AgGridColumn headerName="Nome" field="nome"></AgGridColumn>
                                <AgGridColumn headerName="Note" field="note"></AgGridColumn>
                                <AgGridColumn headerName="Prezzo" field="prezzo"></AgGridColumn>
                            </AgGridReact>
                        </div>
                    </Collapsible>
                ))
            }
            <Dialog open={addingItem} onClose={NOTaddingItem} fullWidth={true}>
                <DialogTitle id="form-dialog-title">Nuovo oggetto</DialogTitle>
                <DialogContent>
                    <InputLabel id="shop">Supermercato</InputLabel>
                    <Select
                        fullWidth
                        required
                        labelId="shop"
                        defaultValue={shopsItems[0] ? shopsItems[0].id : ''}
                        onChange={e => newShop = e.target.value}
                    >
                        {shopsItems.map(shop => <MenuItem value={shop.id} key={shop.id}>{`${shop.nome} (${shop.citta})`}</MenuItem>)}
                    </Select>
                    <TextField label="Nome" type="text" fullWidth required onChange={e => newName = e.target.value} />
                    <TextField label="Note" type="text" fullWidth onChange={e => newNotes = e.target.value} />
                    <TextField label="Prezzo" type="number" fullWidth onChange={e => newPrice = e.target.value} />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={NOTaddingItem} >Annulla</Button>
                    <Button color="primary" variant="outlined" onClick={addItem}>AGGIUNGI</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={removingItem} onClose={NOTremovingItem} fullWidth={true}>
                <DialogTitle id="form-dialog-title">Elimina oggetto</DialogTitle>
                <DialogContent>
                    <DialogContentText>Sei sicuro di voler eliminare definitivamente l'oggetto "{selectedItem.current?selectedItem.current.nome:''}"?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={NOTremovingItem} >Annulla</Button>
                    <Button color="primary" variant="outlined" onClick={removeItem}>ELIMINA</Button>
                </DialogActions>
            </Dialog>

            <Footer>
                <img onClick={() => setAddingItem(true)} src="/add-button.svg" alt="Nuovo oggetto" />
                <img onClick={() => {if(selectedItem.current) setRemovingItem(true)}} src="/remove-button.svg" alt="Rimuovi oggetto" />
            </Footer>
        </>
    )
}
