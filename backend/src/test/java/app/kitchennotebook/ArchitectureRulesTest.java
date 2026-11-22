package app.kitchennotebook;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import com.tngtech.archunit.lang.EvaluationResult;

/**
 * Proves that each layering rule detects a violation: every rule must fail against its deliberately violating
 * fixture class in the test-only package {@code archfixture}, which mirrors the real package layout.
 */
class ArchitectureRulesTest {

    private static final JavaClasses FIXTURES = new ClassFileImporter().importPackages("archfixture");
    private static final ArchitectureRules RULES = new ArchitectureRules("archfixture");

    static Stream<Arguments> rulesAndViolatingFixtures() {
        return Stream.of(
                Arguments.of(RULES.sharedIsIndependentOfFeatures(), "archfixture.shared.web.SharedUsesFeature"),
                Arguments.of(RULES.apiDoesNotUseDomainOrPersistence(), "archfixture.recipes.api.RecipeController"),
                Arguments.of(RULES.repositoriesOnlyFromServiceOfSameFeature(),
                        "archfixture.shopping.service.ShoppingService"),
                Arguments.of(RULES.servicesDoNotReturnEntities(), "archfixture.recipes.service.RecipeService"),
                Arguments.of(RULES.transactionalOnlyInServices(), "archfixture.recipes.api.TransactionalController"),
                Arguments.of(RULES.noSpringStereotypesInDomain(), "archfixture.recipes.domain.RecipeRules"),
                Arguments.of(RULES.noHelperOrUtilsClasses(), "archfixture.recipes.domain.RecipeHelper"));
    }

    @ParameterizedTest(name = "{0} fails on {1}")
    @MethodSource("rulesAndViolatingFixtures")
    void detectsViolation_whenFixtureBreaksRule(ArchRule rule, String violatingFixture) {
        // given the fixture classes, one of which breaks the rule
        // when
        EvaluationResult result = rule.evaluate(FIXTURES);

        // then
        assertThat(result.hasViolation()).isTrue();
        assertThat(result.getFailureReport().getDetails()).anyMatch(line -> line.contains(violatingFixture));
    }
}
