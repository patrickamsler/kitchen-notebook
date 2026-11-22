package archfixture.shared.web;

import archfixture.recipes.domain.Recipe;

/** ArchUnit fixture violating rule 1: shared code depending on a feature package. */
public class SharedUsesFeature {

    public Class<?> type() {
        return Recipe.class;
    }
}
