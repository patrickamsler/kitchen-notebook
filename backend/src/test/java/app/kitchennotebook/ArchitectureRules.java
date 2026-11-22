package app.kitchennotebook;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.methods;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noMethods;

import java.util.List;

import com.tngtech.archunit.core.domain.Dependency;
import com.tngtech.archunit.core.domain.JavaClass;
import com.tngtech.archunit.core.domain.JavaMethod;
import com.tngtech.archunit.lang.ArchCondition;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.CompositeArchRule;
import com.tngtech.archunit.lang.ConditionEvents;
import com.tngtech.archunit.lang.SimpleConditionEvent;

/**
 * The layering rules of docs/development/backend.md (design D2), parameterised by the root package so they can be
 * proven against violating fixtures (package {@code archfixture}) as well as applied to the real code.
 */
final class ArchitectureRules {

    static final List<String> FEATURES = List.of("accounts", "notebooks", "invitations", "recipes", "shopping", "media");

    private final String root;

    ArchitectureRules(String root) {
        this.root = root;
    }

    /** 1. {@code shared} does not depend on feature packages. */
    ArchRule sharedIsIndependentOfFeatures() {
        String[] features = FEATURES.stream().map(feature -> root + "." + feature + "..").toArray(String[]::new);
        return noClasses().that().resideInAPackage(root + ".shared..")
                .should().dependOnClassesThat().resideInAnyPackage(features)
                .as("1. shared does not depend on feature packages")
                .allowEmptyShould(true);
    }

    /** 2. {@code api} packages do not depend on {@code domain} or {@code persistence}. */
    ArchRule apiDoesNotUseDomainOrPersistence() {
        return noClasses().that().resideInAPackage(root + ".*.api..")
                .should().dependOnClassesThat().resideInAnyPackage(root + ".*.domain..", root + ".*.persistence..")
                .as("2. api packages do not depend on domain or persistence")
                .allowEmptyShould(true);
    }

    /** 3. Repositories are used only by {@code service} packages of the same feature. */
    ArchRule repositoriesOnlyFromServiceOfSameFeature() {
        return classes().that().areAssignableTo(org.springframework.data.repository.Repository.class)
                .and().resideInAPackage(root + "..")
                .should(new ArchCondition<>("be used only from the service package of the same feature") {
                    @Override
                    public void check(JavaClass repository, ConditionEvents events) {
                        String feature = feature(repository);
                        for (Dependency dependency : repository.getDirectDependenciesToSelf()) {
                            JavaClass origin = dependency.getOriginClass();
                            String originPackage = origin.getPackageName();
                            boolean sameFeatureService = originPackage.startsWith(root + "." + feature + ".service");
                            boolean samePersistencePackage = originPackage.equals(repository.getPackageName());
                            if (!sameFeatureService && !samePersistencePackage) {
                                events.add(SimpleConditionEvent.violated(dependency, dependency.getDescription()));
                            }
                        }
                    }
                })
                .as("3. repositories are accessed only from service packages of the same feature")
                .allowEmptyShould(true);
    }

    /** 4. Public methods of {@code @Service} classes do not return entities. */
    ArchRule servicesDoNotReturnEntities() {
        return methods().that().arePublic()
                .and().areDeclaredInClassesThat().areAnnotatedWith(org.springframework.stereotype.Service.class)
                .and().areDeclaredInClassesThat().resideInAPackage(root + "..")
                .should(new ArchCondition<>("not return @Entity types") {
                    @Override
                    public void check(JavaMethod method, ConditionEvents events) {
                        method.getReturnType().getAllInvolvedRawTypes().stream()
                                .filter(type -> type.isAnnotatedWith(jakarta.persistence.Entity.class))
                                .forEach(entity -> events.add(SimpleConditionEvent.violated(method,
                                        method.getFullName() + " returns entity " + entity.getName())));
                    }
                })
                .as("4. public methods of @Service classes do not return @Entity types")
                .allowEmptyShould(true);
    }

    /** 5. {@code @Transactional} only in {@code service} packages and {@code shared/tenancy}. */
    ArchRule transactionalOnlyInServices() {
        String[] allowed = {root + ".*.service..", root + ".shared.tenancy.."};
        ArchRule onClasses = noClasses().that().resideInAPackage(root + "..").and().resideOutsideOfPackages(allowed)
                .should().beAnnotatedWith(org.springframework.transaction.annotation.Transactional.class)
                .orShould().beAnnotatedWith(jakarta.transaction.Transactional.class)
                .allowEmptyShould(true);
        ArchRule onMethods = noMethods().that().areDeclaredInClassesThat().resideInAPackage(root + "..")
                .and().areDeclaredInClassesThat().resideOutsideOfPackages(allowed)
                .should().beAnnotatedWith(org.springframework.transaction.annotation.Transactional.class)
                .orShould().beAnnotatedWith(jakarta.transaction.Transactional.class)
                .allowEmptyShould(true);
        return CompositeArchRule.of(onClasses).and(onMethods)
                .as("5. @Transactional only in service packages and shared/tenancy");
    }

    /** 6. No Spring stereotypes in {@code domain} packages. */
    ArchRule noSpringStereotypesInDomain() {
        return noClasses().that().resideInAPackage(root + ".*.domain..")
                .should().beMetaAnnotatedWith(org.springframework.stereotype.Component.class)
                .as("6. classes in domain packages carry no Spring stereotype annotations")
                .allowEmptyShould(true);
    }

    /** 7. No {@code *Helper} or {@code *Utils} classes. */
    ArchRule noHelperOrUtilsClasses() {
        return noClasses().that().resideInAPackage(root + "..")
                .should().haveSimpleNameEndingWith("Helper")
                .orShould().haveSimpleNameEndingWith("Utils")
                .as("7. no class name ends in Helper or Utils")
                .allowEmptyShould(true);
    }

    List<ArchRule> all() {
        return List.of(sharedIsIndependentOfFeatures(), apiDoesNotUseDomainOrPersistence(),
                repositoriesOnlyFromServiceOfSameFeature(), servicesDoNotReturnEntities(),
                transactionalOnlyInServices(), noSpringStereotypesInDomain(), noHelperOrUtilsClasses());
    }

    private String feature(JavaClass javaClass) {
        String relative = javaClass.getPackageName().substring(root.length() + 1);
        int dot = relative.indexOf('.');
        return dot < 0 ? relative : relative.substring(0, dot);
    }
}
