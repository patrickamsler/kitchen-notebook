package app.kitchennotebook.shared.tenancy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.support.TransactionTemplate;

import app.kitchennotebook.support.KnIntegrationTest;

/**
 * Row-level security on the test-only tenant table {@code rls_probe} (PLT-07). One pooled connection, so every
 * transaction reuses the connection of the previous one.
 */
@KnIntegrationTest
@TestPropertySource(properties = "spring.datasource.hikari.maximum-pool-size=1")
class RlsProbeRlsIT {

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    TransactionTemplate transaction;

    @Autowired
    TenantContext tenantContext;

    private final UUID user = UUID.randomUUID();

    @Test
    @DisplayName("PLT-07 the app connects as kn_app without BYPASSRLS and Flyway ran as kn_owner")
    void PLT07_appConnectsAsNonOwnerWithoutBypassRls() {
        // given the running application
        // when
        String currentUser = jdbc.queryForObject("select current_user", String.class);
        Boolean bypassRls = jdbc.queryForObject(
                "select rolbypassrls from pg_roles where rolname = current_user", Boolean.class);
        String tableOwner = jdbc.queryForObject(
                "select tableowner from pg_tables where tablename = 'rls_probe'", String.class);
        String flywayHistoryOwner = jdbc.queryForObject(
                "select tableowner from pg_tables where tablename = 'flyway_schema_history'", String.class);

        // then
        assertThat(currentUser).isEqualTo("kn_app");
        assertThat(bypassRls).isFalse();
        assertThat(tableOwner).isEqualTo("kn_owner");
        assertThat(flywayHistoryOwner).isEqualTo("kn_owner");
    }

    @Test
    @DisplayName("PLT-07 rows of another notebook are invisible")
    void PLT07_rowsOfOtherNotebookInvisible() {
        // given tenant rows in notebooks A and B
        UUID notebookA = UUID.randomUUID();
        UUID notebookB = UUID.randomUUID();
        insertAs(notebookA, "a1");
        insertAs(notebookA, "a2");
        insertAs(notebookB, "b1");

        // when notebook A selects all rows without a filter
        List<UUID> visibleNotebooks = transaction.execute(status -> {
            tenantContext.set(notebookA, user);
            return jdbc.queryForList("select notebook_id from rls_probe", UUID.class);
        });

        // then
        assertThat(visibleNotebooks).hasSize(2).containsOnly(notebookA);
    }

    @Test
    @DisplayName("PLT-07 without a tenant context no rows are visible and inserts are rejected")
    void PLT07_noTenantContextNoRows() {
        // given tenant rows in notebook A
        UUID notebookA = UUID.randomUUID();
        insertAs(notebookA, "a1");

        // when a transaction runs without a tenant context
        Integer visible = transaction.execute(status ->
                jdbc.queryForObject("select count(*) from rls_probe", Integer.class));

        // then
        assertThat(visible).isZero();
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> jdbc.update(
                "insert into rls_probe (notebook_id, label) values (?, 'no context')", notebookA)))
                .isInstanceOf(DataAccessException.class)
                .rootCause().hasMessageContaining("row-level security");
    }

    @Test
    @DisplayName("PLT-07 writing into another notebook is rejected")
    void PLT07_writeIntoOtherNotebookRejected() {
        // given a transaction with notebook A as tenant context, and a row of notebook A
        UUID notebookA = UUID.randomUUID();
        UUID notebookB = UUID.randomUUID();
        insertAs(notebookA, "a1");

        // when it inserts a row of notebook B / then the database rejects it
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
            tenantContext.set(notebookA, user);
            jdbc.update("insert into rls_probe (notebook_id, label) values (?, 'b1')", notebookB);
        })).isInstanceOf(DataAccessException.class).rootCause().hasMessageContaining("row-level security");

        // when it moves its row to notebook B / then the database rejects it
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
            tenantContext.set(notebookA, user);
            jdbc.update("update rls_probe set notebook_id = ? where notebook_id = ?", notebookB, notebookA);
        })).isInstanceOf(DataAccessException.class).rootCause().hasMessageContaining("row-level security");
    }

    @Test
    @DisplayName("PLT-07 tenant context does not leak to the next transaction on a pooled connection")
    void PLT07_contextDoesNotLeakAcrossPooledConnections() {
        // given a pooled connection that ran a transaction for notebook A
        UUID notebookA = UUID.randomUUID();
        Integer firstBackend = transaction.execute(status -> {
            tenantContext.set(notebookA, user);
            jdbc.update("insert into rls_probe (notebook_id, label) values (?, 'a1')", notebookA);
            return jdbc.queryForObject("select pg_backend_pid()", Integer.class);
        });

        // when the same connection is reused for a transaction without a tenant context
        record Reuse(Integer backend, Integer visible, String notebookSetting) {
        }
        Reuse reuse = transaction.execute(status -> new Reuse(
                jdbc.queryForObject("select pg_backend_pid()", Integer.class),
                jdbc.queryForObject("select count(*) from rls_probe", Integer.class),
                jdbc.queryForObject("select current_setting('app.notebook_id', true)", String.class)));

        // then
        assertThat(reuse.backend()).isEqualTo(firstBackend);
        assertThat(reuse.notebookSetting()).isEmpty();
        assertThat(reuse.visible()).isZero();
    }

    private void insertAs(UUID notebookId, String label) {
        transaction.executeWithoutResult(status -> {
            tenantContext.set(notebookId, user);
            jdbc.update("insert into rls_probe (notebook_id, label) values (?, ?)", notebookId, label);
        });
    }
}
