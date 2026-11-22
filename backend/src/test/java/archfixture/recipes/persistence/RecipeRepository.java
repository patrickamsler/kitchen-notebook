package archfixture.recipes.persistence;

import org.springframework.data.repository.Repository;

import archfixture.recipes.domain.Recipe;

/** ArchUnit fixture: a repository of the recipes feature. */
public interface RecipeRepository extends Repository<Recipe, Long> {
}
