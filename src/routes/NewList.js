import React, { useContext, useState, useEffect } from 'react'

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

    const classes = useStyles()
    const { API, username } = useContext(SessionContext)
    const [addingItem, setAddingItem] = useState(false)
    const [firstStep, setFirstStep] = useState(true)

    const [groups, setGroups] = useState([])
    const [shops, setShops] = useState({})
    const [name, setName] = useState('')

    const [selectedGroups, setSelectedGroups] = useState([])
    const [selectedShop, setSelectedShop] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedRecipes, setSelectedRecipes] = useState([])

    const [itemToAdd, setItemToAdd] = useState(null)
    const [itemToAddQty, setItemToAddQty] = useState(1)
    const [recipeToAdd, setRecipeToAdd] = useState(null)

    const removeGroup = group => {
        setGroups(groups => [...groups, group])
        setSelectedGroups(groups => groups.filter(gr => gr.id !== group.id))
    }
    const selectGroup = group => {
        setGroups(groups => groups.filter(gr => gr.id !== group.id))
        setSelectedGroups(groups => [...groups, group])
    }

    const canSubmit = _ => 
        canContinue()
        && (selectedItems.length > 0 || selectedRecipes.length > 0) 
        
    const canContinue = _ =>
        selectedGroups.length > 0 
        && selectedShop
        && name

    const nextStep = _ => { if(canContinue()) setFirstStep(false) }

    const handleSubmit = a => console.log(a)

    const openDialog = _ => { if(selectedShop) setAddingItem(true) }
    const closeDialog = _ => setAddingItem(false)

    const addItem = _ => {
        if(recipeToAdd) {
            setSelectedRecipes(recipes => [...recipes, recipeToAdd])
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

    const removeItem = item => {
        setSelectedItems(items => items.filter(i => i.id !== item.id))
    }

    const getItemDescription = item => (
        <div className="item" key={item.id}>
            <p>{item.nome}{item.acquirente ? ` (${item.acquirente})` : ''}</p>
            <p>{item.note && `(${item.note})`}</p>
            <p>{item.quantita} pz.</p>
            <p onClick={() => removeItem(item)}>🗑️</p>
        </div>
    )

    const getRecipeDescription = recipe => {
        return (
            <Collapsible header={<><p onClick={() => removeItem(1)}>🗑️</p><p>{recipe.nome+(recipe.descrizione?`\n(${recipe.descrizione})`:'')}</p></>} isopen={false} className="recipe small" key={recipe.id}>
                { recipe.items.map(getItemDescription) }
            </Collapsible>
       )
    }

    useEffect(() => {
        API.current.get(`/groups?username=${username}`).then(res => { 
            setGroups(Array.isArray(res.data)?res.data:[res.data])
            console.log('Groups fetched!')
        })
        API.current.get(`/user_shops?username=${username}`).then(async res => {
            let shops = {}
            for (let i = 0; i < res.data.length; i++) {
                const shop = res.data[i]

                const items = await API.current.get(`/shop_items?shopid=${shop.id}`)
                shop.items = items.data

                const recipes = (await API.current.get(`/shop_user_recipes?shopid=${shop.id}&username=${username}`)).data
                for (let i = 0; i < recipes.length; i++) {
                    const recipe = recipes[i]
                    const recipeItems = (await API.current.get(`/recipe_items?recipeid=${recipe.id}`)).data
                    recipe.items = recipeItems
                }
                shop.recipes = recipes

                shops[shop.id] = shop
            }
            setShops(shops)
        })
    }, [API, username])
    
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
                                {
                                    selectedGroups.map(group => 
                                        <Chip
                                            className={classes.chips}
                                            key={group.id}
                                            label={ group.nome }
                                            onClick={_ => removeGroup(group)}
                                            variant="outlined"
                                            icon={<CheckCircleIcon className={classes.chipIcon} />}
                                        />
                                    )
                                }
                                { 
                                    groups.map(group => 
                                        <Chip
                                            className={classes.chips}
                                            key={group.id}
                                            label={ group.nome }
                                            onClick={_ => selectGroup(group)}
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
                            { selectedItems.map(getItemDescription) }
                        </Collapsible>
                        <Collapsible header="Ricette" isopen={true}>
                            { selectedRecipes.length <= 0 && <p>Nessuna ricetta</p> }
                            { selectedRecipes.map(getRecipeDescription) }
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
                                shops[selectedShop].recipes.filter(recipe => !selectedRecipes.includes(recipe))
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
