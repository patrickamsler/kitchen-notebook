package app.kitchennotebook.shared.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.support.TransactionTemplate;

import app.kitchennotebook.support.KnIntegrationTest;

@KnIntegrationTest
class BaseEntityIT {

    @Autowired
    BaseEntityProbeRepository repository;

    @Autowired
    TransactionTemplate transaction;

    @Test
    @DisplayName("generates a UUIDv7 id and timestamps when persisted")
    void generatesUuidV7IdAndTimestamps_whenPersisted() {
        // given
        BaseEntityProbe probe = new BaseEntityProbe("first");

        // when
        BaseEntityProbe saved = transaction.execute(status -> repository.saveAndFlush(probe));

        // then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId().version()).isEqualTo(7);
        assertThat(saved.getVersion()).isZero();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("increments the version when updated")
    void incrementsVersion_whenUpdated() {
        // given
        UUID id = transaction.execute(status -> repository.saveAndFlush(new BaseEntityProbe("before")).getId());

        // when
        transaction.executeWithoutResult(status -> repository.findById(id).orElseThrow().setLabel("after"));

        // then
        BaseEntityProbe reloaded = repository.findById(id).orElseThrow();
        assertThat(reloaded.getLabel()).isEqualTo("after");
        assertThat(reloaded.getVersion()).isEqualTo(1);
    }
}
