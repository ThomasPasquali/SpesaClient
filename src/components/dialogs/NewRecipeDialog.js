import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import React, { useState } from 'react'
import GroupSelector from '../GroupSelector'

export default function NewRecipeDialog({ opened, setOpened, createRecipe, shops={}, groups=[] }) {
    const [name, setName] = useState('')
    const [desc, setDesc] = useState('')
    const [selectedShop, setSelectedShop] = useState(null)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const closeDialog = _ => setOpened(false)
    const canSubmit = _ => name && desc && selectedShop && selectedGroup
    return (
        <Dialog open={opened} onClose={closeDialog} fullWidth={true}>
            <DialogTitle id="form-dialog-title">Nuova ricetta</DialogTitle>
            <DialogContent>
                <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} variant="filled" />
                <TextField label="Descrizione" value={desc} onChange={e => setDesc(e.target.value)} variant="filled" />
                <Autocomplete
                    options={Object.keys(shops)}
                    onChange={(e, val) => { if(val) setSelectedShop(val) }}
                    getOptionLabel={shopid => `${shops[shopid].nome} ${shops[shopid].citta}`}
                    renderInput={(params) => <TextField {...params} label="Supermercato" variant="filled" />}
                />
                <p>Gruppo</p>
                <GroupSelector groups={groups} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog} >Chiudi</Button>
                <Button onClick={_ => createRecipe({name, description:desc, shopid:selectedShop, groupid:selectedGroup.id})} variant="outlined" disabled={!canSubmit()} >Aggiungi</Button>
            </DialogActions>
        </Dialog>
    )
}
