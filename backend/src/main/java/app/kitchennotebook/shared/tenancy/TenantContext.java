package app.kitchennotebook.shared.tenancy;

import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Sets the tenant for PostgreSQL row-level security on the connection of the current transaction (ADR-004).
 *
 * <p>Uses {@code set_config(name, value, true)}, the parameterisable form of {@code SET LOCAL}: the values end with
 * the transaction and never leak to the next user of a pooled connection. Call it first thing in every service
 * transaction that touches tenant tables. See docs/development/tenancy.md.
 */
@Component
public class TenantContext {

    private static final String SET_CONTEXT_SQL =
            "select set_config('app.notebook_id', ?, true), set_config('app.user_id', ?, true)";

    private final JdbcTemplate jdbcTemplate;

    public TenantContext(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * @param notebookId the notebook whose rows the transaction may see and write; {@code null} for none
     * @param userId     the acting user; {@code null} for none
     * @throws IllegalStateException if no transaction is active
     */
    public void set(@Nullable UUID notebookId, @Nullable UUID userId) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException(
                    "TenantContext must be set inside a transaction, otherwise the setting would not be scoped");
        }
        jdbcTemplate.queryForList(SET_CONTEXT_SQL, asText(notebookId), asText(userId));
    }

    private static String asText(@Nullable UUID id) {
        return id == null ? "" : id.toString();
    }
}
