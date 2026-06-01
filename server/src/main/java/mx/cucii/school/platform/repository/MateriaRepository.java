package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.Materia;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface MateriaRepository extends ListCrudRepository<Materia, Integer> {
    List<Materia> findByPlanEstudioIdAndIsActiveTrue(Integer planEstudioId);
}
