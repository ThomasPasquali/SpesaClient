import React, { useEffect, useState, useContext, useMemo } from 'react'
import { SessionContext } from '../App'
import Navbar from '../components/Navbar'

import Button from '@material-ui/core/Button'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

import Footer from '../components/Footer'
import Lib from '../Lib'
import NewRecipeDialog from '../components/dialogs/NewRecipeDialog';

export default function Items() {

    const { API, username } = useContext(SessionContext)
    const [shops, setShops] = useState({})
    const [groups, setGroups] = useState([])
    const [addingRecipe, setAddingRecipe] = useState(false)

    const lib = useMemo(_ => new Lib(API, username), [API, username])
    useEffect(_ => {
        const fetch = async _ => {
            setShops(await lib.getShops())
            setGroups(await lib.getGroups())
        }
        fetch()
    }, [lib])
    
    return (
        <>
            <Navbar title="Gestione ricette" />

            { Object.keys(shops).map(shopid => 
                shops[shopid].recipes.map(recipe => 
                    lib.getRecipeDescription(
                        recipe,
                        {
                            dRecipe: recipe => {
                                if(recipe && window.confirm(`Eliminare la ricetta "${recipe.nome}"?`)) {
                                    API.current.delete(`/recipe?recipeid=${recipe.id}`).then(res => {
                                        if(res.status === 200)
                                            setShops(shops => {
                                                let s = {...shops}
                                                for(shopid in s)
                                                    s[shopid].recipes = s[shopid].recipes.filter(r => r.id !== recipe.id)
                                                return s
                                            })
                                        else lib.handleError(res)
                                    }).catch(lib.handleError)
                                }
                            },
                            dRecipeItem: (recipe, item) => {
                                if(recipe && item)
                                    API.current.delete(`/recipe_item?recipeid=${recipe.id}&itemid=${item.id}`).then(res => {
                                        if(res.status === 200)
                                            setShops(shops => {
                                                let s = {...shops}
                                                for(let shopid in s)
                                                    for (let i = 0; i < s[shopid].recipes.length; i++) {
                                                        const r = s[shopid].recipes[i]
                                                        console.log(r);
                                                        if(r.id === recipe.id) {
                                                            r.items = r.items.filter(itm => itm.id !== item.id)
                                                            break;
                                                        }
                                                    }
                                                return s
                                            })
                                        else lib.handleError(res)
                                    }).catch(lib.handleError)
                            }
                        },
                        {
                            aOpts: shops[shopid].items,
                            aChange: (recipe, item) => {
                                if(recipe && item)
                                    API.current.put('/recipe_item',{ recipeid: recipe.id, itemid: item.id }).then(res => {
                                        if(res.status === 200)
                                            setShops(shops => {
                                                let s = {...shops}
                                                for(let shopid in s)
                                                    for(let r of s[shopid].recipes)
                                                        if(r.id === recipe.id) {
                                                            let exists = false
                                                            for (let i = 0; i < recipe.items.length; i++)
                                                                if(recipe.items[i].id === item.id) {
                                                                    recipe.items[i].quantita++
                                                                    exists = true;
                                                                    break;
                                                                }
                                                            if(!exists) {
                                                                item.quantita = 1
                                                                recipe.items.unshift(item)
                                                            }
                                                            break;
                                                        }
                                                    return s
                                            })
                                        else lib.handleError(res)
                                    }).catch(lib.handleError)
                            },
                            aLabel: 'Aggiungi oggetto'
                        })))
            }

            <NewRecipeDialog opened={addingRecipe} setOpened={setAddingRecipe} shops={shops} groups={groups} createRecipe={newRecipe => {
                API.current.put(`/recipe`, newRecipe).then(res => {
                    if(res.status === 200) {
                        setShops(shops => {
                            let r = {
                                id: res.data.recipeid,
                                nome: newRecipe.name,
                                descrizione: newRecipe.description,
                                items: []
                            }
                            shops[newRecipe.shopid].recipes.unshift(r)
                            return shops
                        })
                        setAddingRecipe(false)
                    } else lib.handleError(res)
                })
            }} />

            <Footer>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={_ => setAddingRecipe(true)}/>
            </Footer>
        </>
    )
}
