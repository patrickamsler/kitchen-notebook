package app.kitchennotebook.shared.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/** Test-only entity for {@link BaseEntityIT}. */
@Entity
@Table(name = "base_entity_probe")
public class BaseEntityProbe extends BaseEntity {

    private String label;

    protected BaseEntityProbe() {
    }

    public BaseEntityProbe(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
