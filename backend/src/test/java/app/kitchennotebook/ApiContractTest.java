package app.kitchennotebook;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.RestController;

import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;

/**
 * PLT-09: an operation of api/openapi.yaml that no controller implements fails the build. Operations added to an
 * implemented interface already fail compilation; this test catches interfaces (tags) nobody implements.
 */
class ApiContractTest {

    @Test
    @DisplayName("PLT-09 every generated API interface is implemented by a controller")
    void PLT09_everyGeneratedApiInterfaceIsImplemented() {
        // given the generated API interfaces
        var production = new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages("app.kitchennotebook");

        // when / then
        classes().that().resideInAPackage("app.kitchennotebook.api")
                .and().areInterfaces()
                .and().haveSimpleNameEndingWith("Api")
                .should(new ArchCondition<>("be implemented by a @RestController") {
                    @Override
                    public void check(JavaClass api, ConditionEvents events) {
                        boolean implemented = api.getAllSubclasses().stream()
                                .anyMatch(type -> type.isAnnotatedWith(RestController.class));
                        events.add(new SimpleConditionEvent(api, implemented,
                                api.getName() + (implemented ? " is" : " is not") + " implemented by a controller"));
                    }
                })
                .check(production);
    }
}
