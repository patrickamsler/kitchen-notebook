package app.kitchennotebook.shared.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/** Test-only repository for {@link BaseEntityIT}. */
public interface BaseEntityProbeRepository extends JpaRepository<BaseEntityProbe, UUID> {
}
