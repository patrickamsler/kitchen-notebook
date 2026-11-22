package archfixture.recipes.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** ArchUnit fixture: a well-formed entity. */
@Entity
public class Recipe {

    @Id
    private Long id;
}
