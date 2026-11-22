package archfixture.recipes.api;

import org.springframework.transaction.annotation.Transactional;

/** ArchUnit fixture violating rule 5: @Transactional outside a service package. */
public class TransactionalController {

    @Transactional
    public void save() {
    }
}
