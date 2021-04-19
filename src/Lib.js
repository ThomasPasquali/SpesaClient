import { TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Collapsible from "./components/Collapsible";

class Lib {
    constructor(API, username) {
        this.API = API
        this.username = username
    }

    noop() {}

    /***************FETCH***************/
    /*getRecipes() {
        return this.API.current.get(`/user_recipes?username=${this.username}`).then(res => {
            let recipes = []
            for (let i = 0; i < res.data.length; i++) {
                const recipe = res.data[i];
                this.API.current.get(`/recipe_items?recipeid=${recipe.id}`).then(items => {
                    recipe.items = items.data
                    recipes.push(recipe)
                }).catch(this.handleError)
            }
            return recipes
        }).catch(this.handleError)
    }*/

    async getShops() {
        try {
            let res = await this.API.current.get(`/user_shops?username=${this.username}`)
            let shops = {}
            for (let i = 0; i < res.data.length; i++) {
                const shop = res.data[i]
                shop.items = (await this.API.current.get(`/shop_items?shopid=${shop.id}`)).data
                shop.recipes = (await this.API.current.get(`/shop_user_recipes?shopid=${shop.id}&username=${this.username}`)).data
                for (let i = 0; i < shop.recipes.length; i++)
                    shop.recipes[i].items = [].concat((await this.API.current.get(`/recipe_items?recipeid=${shop.recipes[i].id}`)).data)
                shops[shop.id] = shop
            }
            return shops
        } catch(err) { this.handleError(err) }
    }

    async getGroups() {
        try {
            return [].concat((await this.API.current.get(`/groups?username=${this.username}`)).data)
        } catch(err) { this.handleError(err) }
    }

    handleError(err, fatal=false) {
        console.error(err, `fatal=${fatal}`)
    }


    /*****************JSX****************/
    getItemDescription = (item, recipe=null, deleteRecipeItem=null, deleteItem=null) => (
        <div className="item" key={item.id+""+(recipe?recipe.id:'')}>
            <p>{item.nome}</p>
            <p>{item.note && `(${item.note})`}</p>
            <p>{item.quantita} pz.</p>
            { ( deleteRecipeItem || deleteItem) &&
                <p onClick={() => deleteRecipeItem ? 
                                    deleteRecipeItem(recipe, item) :
                                    deleteItem ? 
                                        deleteItem(item) : 
                                        this.noop() }>🗑️</p> }
        </div>
    )
    
    getRecipeDescription = (recipe, {dRecipe=null,dRecipeItem=null}, {aOpts=null,aChange=this.noop,aLabel=''}) => (
        <Collapsible header={(
            <>
                { dRecipe && <p onClick={() => dRecipe(recipe)}>🗑️</p> }
                <p>{recipe.nome+(recipe.quantita?` (x${recipe.quantita})`:'')+(recipe.descrizione?`\n(${recipe.descrizione})`:'')}
                </p>
            </>
            )} isopen={false} className="recipe small" key={recipe.id}>
            { aOpts && <Autocomplete
                style={{ width: '90%' }}
                options={aOpts}
                onChange={(e, val) => aChange(recipe, val)}
                getOptionLabel={item => `${item.nome} ${item.note?`(${item.note})`:''}`}
                renderInput={(params) => <TextField {...params} label={aLabel} variant="standard" />}
            /> }
            { recipe.items.map(item => this.getItemDescription(item, recipe, dRecipeItem)) }
        </Collapsible>
    )
}
export default Lib