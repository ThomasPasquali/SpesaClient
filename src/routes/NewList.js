import React, { useContext, useState, useEffect, useMemo } from 'react'
import { useHistory } from "react-router-dom";

import Navbar from '../components/Navbar'
import { SessionContext } from '../App'

import './css/NewList.css'
import Footer from '../components/Footer'
import Collapsible from '../components/Collapsible'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@material-ui/core'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart'
import DoneOutlineIcon from '@material-ui/icons/DoneOutline'
import { makeStyles } from '@material-ui/core/styles'

import Lib from '../Lib'
import './css/ItemsAndRecipes.css'

const useStyles = makeStyles({
  textFields: {
    //borderBottom: 'solid .2rem var(--secondary)',
    backgroundColor: 'white',
  },
  chips: {
      fontSize: '1.2rem',
  },
  chipIcon: {
      color: 'var(--secondary)',
  }
})

export default function NewList() {

    const history = useHistory()
    const classes = useStyles()
    const { API, username } = useContext(SessionContext)
    const [addingItem, setAddingItem] = useState(false)
    const [firstStep, setFirstStep] = useState(true)

    const [groups, setGroups] = useState([])
    const [shops, setShops] = useState({})
    const [name, setName] = useState('')

    const [selectedGroup, setSelectedGroup] = useState(null)
    const [selectedShop, setSelectedShop] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedRecipes, setSelectedRecipes] = useState([])

    const [itemToAdd, setItemToAdd] = useState(null)
    const [itemToAddQty, setItemToAddQty] = useState(1)
    const [recipeToAdd, setRecipeToAdd] = useState(null)

    const lib = useMemo(_ => new Lib(API, username), [API, username])
    useEffect(_ => {
        const fetch = async _ => {
            setShops(await lib.getShops())
            setGroups(await lib.getGroups())
        }
        fetch()
    }, [lib])

    const canSubmit = _ => 
        canContinue()
        && (selectedItems.length > 0 || selectedRecipes.length > 0) 
        
    const canContinue = _ =>
        selectedGroup != null
        && selectedShop
        && name

    const nextStep = _ => { if(canContinue()) setFirstStep(false) }

    const handleSubmit = _ => {
        let items = [...selectedItems], i
        for (const recipe of selectedRecipes)
            for (const item of recipe.items) {
                let qta = parseInt(item.quantita) * parseInt(recipe.quantita??1)
                if ((i = items.findIndex(it => it.id === item.id)) >= 0)
                    items[i].quantita = parseInt(items[i].quantita) + parseInt(qta)
                else
                    items.push(item)
            }
        API.current.put(`/list`, {username, listname: name, group: selectedGroup, shopid: selectedShop, items}).then(res => {
            if(res.status === 200)
                history.push('/shop/'+res.data.listid)
            else
                console.log(res);
        }).catch(err => {
            alert('Errore')
            console.log(err)
        })
    }

    const openDialog = _ => { if(selectedShop) setAddingItem(true) }
    const closeDialog = _ => setAddingItem(false)

    const addItem = _ => {
        if(recipeToAdd) {
            setSelectedRecipes(recipes => {
                let i
                if((i = selectedRecipes.findIndex(r => r.id === recipeToAdd.id)) >= 0) {
                    recipes[i].quantita = (recipes[i].quantita??1) + 1
                    return recipes
                }
                return [...recipes, recipeToAdd]
            })
            setRecipeToAdd(null)
        }
        if(itemToAdd && itemToAddQty > 0) {
            const i = selectedItems.indexOf(itemToAdd)
            if(i >= 0)  
                setSelectedItems(items => {
                    items[i].quantita = (items[i].quantita?parseInt(items[i].quantita):0)+parseInt(itemToAddQty)
                    return items
                })
            else {
                itemToAdd.quantita = itemToAddQty
                setSelectedItems(items => [...items, itemToAdd])
            }
            setItemToAdd(null)
            setItemToAddQty(1)
        }
    }

    const removeItem = item => setSelectedItems(items => items.filter(i => i.id !== item.id))
    
    const removeRecipe = recipe => setSelectedRecipes(recipes => {
        recipes = [...recipes]
        let i = recipes.indexOf(recipe)
        recipes[i].quantita--
        return recipes[i].quantita > 0 ? recipes : recipes.filter(r => r.id !== recipe.id)
    })

    const removeRecipeItem = (recipe, item) => setSelectedRecipes(recipes => {
        recipes = [...recipes]
        let i = recipes.indexOf(recipe)
        recipes[i].items = recipes[i].items.filter(itm => itm.id !== item.id)
        return recipes
    })
    
    return (
        <>
            <Navbar title="Nuova lista" />

            <form onSubmit={handleSubmit}>
                { firstStep && (
                    <>
                        <Collapsible header="Informazioni" isopen={true} className="field-wrap">
                            <TextField label="Nome" className={classes.textFields} value={name} onChange={e => setName(e.target.value)} variant="filled" />
                            <Autocomplete
                                options={Object.keys(shops)}
                                onChange={(e, val) => setSelectedShop(val)}
                                getOptionLabel={shopid => `${shops[shopid].nome} ${shops[shopid].citta}`}
                                renderInput={(params) => <TextField className={classes.textFields} {...params} label="Supermercato" variant="filled" />}
                            />
                        </Collapsible>

                        <Collapsible header="Gruppi" isopen={true}>
                            <div id="groups">
                                {   selectedGroup &&
                                    <Chip
                                        className={classes.chips}
                                        key={selectedGroup.id}
                                        label={ selectedGroup.nome }
                                        variant="outlined"
                                        icon={<CheckCircleIcon className={classes.chipIcon} />}
                                    />
                                }
                                { 
                                    groups.map(group => 
                                        (selectedGroup == null || group.id !== selectedGroup.id) &&
                                        <Chip
                                            className={classes.chips}
                                            key={group.id}
                                            label={ group.nome }
                                            onClick={_ => setSelectedGroup(group)}
                                            variant="outlined"
                                        />
                                    )
                                }
                            </div>
                        </Collapsible>
                    </>
                )}
                { !firstStep && (
                    <>
                        <Collapsible header="Oggetti" isopen={true}>
                            { selectedItems.length <= 0 && <p>Nessun oggetto</p> }
                            { selectedItems.map(item => lib.getItemDescription(item, null, null, removeItem)) }
                        </Collapsible>
                        <Collapsible header="Ricette" isopen={true}>
                            { selectedRecipes.length <= 0 && <p>Nessuna ricetta</p> }
                            { selectedRecipes.map(recipe => lib.getRecipeDescription(recipe, {dRecipe: removeRecipe, dRecipeItem: removeRecipeItem}, {})) }
                        </Collapsible>
                    </>
                )}
            </form>

            <Dialog open={addingItem} onClose={closeDialog} fullWidth={true}>
                <DialogTitle id="form-dialog-title">Aggiungi oggetti e ricette</DialogTitle>
                <DialogContent>
                    <Grid container direction="row" justify="space-between" alignItems="center" >
                        <Grid item xs={9}>
                            <Autocomplete
                                value={itemToAdd}
                                options={shops[selectedShop] ? shops[selectedShop].items : []}
                                onChange={(e, val) => setItemToAdd(val)}
                                getOptionLabel={item => item?item.nome+(item.note&&`(${item.note})`):''}
                                renderInput={(params) => <TextField {...params} label="Oggetto" variant="outlined" />}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField label="Qta" type="number" value={itemToAddQty} onChange={e => setItemToAddQty(e.target.value)} />
                        </Grid>
                    </Grid>
                    <Autocomplete
                        value={recipeToAdd}
                        options={
                            shops[selectedShop] ? 
                                shops[selectedShop].recipes//.filter(recipe => !selectedRecipes.includes(recipe))
                                : []}
                        onChange={(e, val) => setRecipeToAdd(val)}
                        getOptionLabel={recipe => recipe?recipe.nome:''}
                        renderInput={(params) => <TextField {...params} label="Ricetta" variant="outlined" />}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} >Chiudi</Button>
                    <Button onClick={addItem} >Aggiungi</Button>
                </DialogActions>
            </Dialog>

            <Footer>
                { firstStep && <Button startIcon={<NavigateNextIcon />} onClick={nextStep} disabled={!canContinue()} /> }
                { 
                    !firstStep && (
                        <>
                            <Button startIcon={<AddShoppingCartIcon />} onClick={openDialog} />
                            <Button startIcon={<DoneOutlineIcon />} onClick={handleSubmit}  disabled={!canSubmit()} />
                        </>
                    )
                }
            </Footer>

        </>
    )
}
