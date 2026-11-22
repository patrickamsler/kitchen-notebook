package app.kitchennotebook;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;

/**
 * Applies the layering rules of docs/development/backend.md to the production code.
 */
class ArchitectureTest {

    private static final JavaClasses PRODUCTION = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("app.kitchennotebook");

    private final ArchitectureRules rules = new ArchitectureRules("app.kitchennotebook");

    @Test
    @DisplayName("1. shared does not depend on feature packages")
    void sharedIsIndependentOfFeatures() {
        rules.sharedIsIndependentOfFeatures().check(PRODUCTION);
    }

    @Test
    @DisplayName("2. api packages do not depend on domain or persistence")
    void apiDoesNotUseDomainOrPersistence() {
        rules.apiDoesNotUseDomainOrPersistence().check(PRODUCTION);
    }

    @Test
    @DisplayName("3. repositories are accessed only from service packages of the same feature")
    void repositoriesOnlyFromServiceOfSameFeature() {
        rules.repositoriesOnlyFromServiceOfSameFeature().check(PRODUCTION);
    }

    @Test
    @DisplayName("4. public methods of @Service classes do not return @Entity types")
    void servicesDoNotReturnEntities() {
        rules.servicesDoNotReturnEntities().check(PRODUCTION);
    }

    @Test
    @DisplayName("5. @Transactional only in service packages and shared/tenancy")
    void transactionalOnlyInServices() {
        rules.transactionalOnlyInServices().check(PRODUCTION);
    }

    @Test
    @DisplayName("6. classes in domain packages carry no Spring stereotype annotations")
    void noSpringStereotypesInDomain() {
        rules.noSpringStereotypesInDomain().check(PRODUCTION);
    }

    @Test
    @DisplayName("7. no class name ends in Helper or Utils")
    void noHelperOrUtilsClasses() {
        rules.noHelperOrUtilsClasses().check(PRODUCTION);
    }
}
