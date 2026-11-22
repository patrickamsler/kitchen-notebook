package archfixture.recipes.api;

import archfixture.recipes.domain.Recipe;

/** ArchUnit fixture violating rule 2: an api class using a domain class. */
public class RecipeController {

    public String title(Recipe recipe) {
        return recipe.toString();
    }
}
