package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.PlanEstudio;
import org.springframework.data.repository.ListCrudRepository;

import java.util.Optional;

public interface PlanEstudioRepository extends ListCrudRepository<PlanEstudio, Integer> {
    Optional<PlanEstudio> findByNumeroRvoe(String numeroRvoe);
}
