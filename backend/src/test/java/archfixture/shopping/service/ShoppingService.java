package archfixture.shopping.service;

import archfixture.recipes.persistence.RecipeRepository;

/** ArchUnit fixture violating rule 3: a service using another feature's repository. */
public class ShoppingService {

    private final RecipeRepository recipes;

    public ShoppingService(RecipeRepository recipes) {
        this.recipes = recipes;
    }
}
