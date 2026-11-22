package archfixture.recipes.service;

import org.springframework.stereotype.Service;

import archfixture.recipes.domain.Recipe;
import archfixture.recipes.persistence.RecipeRepository;

/** ArchUnit fixture violating rule 4: a public service method returning an entity. */
@Service
public class RecipeService {

    private final RecipeRepository repository;

    public RecipeService(RecipeRepository repository) {
        this.repository = repository;
    }

    public Recipe find() {
        return null;
    }
}
