package mx.cucii.school.platform.service;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.PlanEstudioRequest;
import mx.cucii.school.platform.dto.PlanEstudioResponse;
import mx.cucii.school.platform.exception.ResourceNotFoundException;
import mx.cucii.school.platform.model.Materia;
import mx.cucii.school.platform.model.PlanEstudio;
import mx.cucii.school.platform.repository.MateriaRepository;
import mx.cucii.school.platform.repository.PlanEstudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PlanEstudioService {

    private static final Set<String> GRADOS_VALIDOS = Set.of("Licenciatura", "Maestría", "Doctorado");

    private final PlanEstudioRepository planEstudioRepository;
    private final MateriaRepository materiaRepository;

    public List<PlanEstudioResponse> findAll() {
        return planEstudioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PlanEstudioResponse findById(Integer id) {
        return planEstudioRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de estudio no encontrado: " + id));
    }

    @Transactional
    public PlanEstudioResponse create(PlanEstudioRequest request) {
        validateRequest(request);
        planEstudioRepository.findByNumeroRvoe(request.numeroRvoe()).ifPresent(p -> {
            throw new IllegalArgumentException("El RVOE ya está registrado");
        });
        OffsetDateTime now = OffsetDateTime.now();
        PlanEstudio nuevo = new PlanEstudio(
                null,
                request.nombre(),
                request.grado(),
                request.numeroRvoe(),
                request.fechaRvoe(),
                request.duracionCuatrimestres(),
                true,
                now,
                now
        );
        return toResponse(planEstudioRepository.save(nuevo));
    }

    @Transactional
    public PlanEstudioResponse update(Integer id, PlanEstudioRequest request) {
        PlanEstudio existing = planEstudioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de estudio no encontrado: " + id));
        validateRequest(request);
        if (!existing.numeroRvoe().equals(request.numeroRvoe())) {
            planEstudioRepository.findByNumeroRvoe(request.numeroRvoe()).ifPresent(p -> {
                throw new IllegalArgumentException("El RVOE ya está registrado");
            });
        }
        PlanEstudio updated = new PlanEstudio(
                existing.id(),
                request.nombre(),
                request.grado(),
                request.numeroRvoe(),
                request.fechaRvoe(),
                request.duracionCuatrimestres(),
                existing.isActive(),
                existing.createdAt(),
                OffsetDateTime.now()
        );
        return toResponse(planEstudioRepository.save(updated));
    }

    @Transactional
    public void delete(Integer id) {
        PlanEstudio existing = planEstudioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de estudio no encontrado: " + id));
        OffsetDateTime now = OffsetDateTime.now();
        List<Materia> materiasActivas = materiaRepository.findByPlanEstudioIdAndIsActiveTrue(id);
        materiasActivas.forEach(m -> materiaRepository.save(new Materia(
                m.id(), m.nombre(), m.clave(), m.creditos(), m.cuatrimestre(),
                m.planEstudioId(), false, m.createdAt(), now
        )));
        planEstudioRepository.save(new PlanEstudio(
                existing.id(), existing.nombre(), existing.grado(),
                existing.numeroRvoe(), existing.fechaRvoe(), existing.duracionCuatrimestres(),
                false, existing.createdAt(), now
        ));
    }

    private void validateRequest(PlanEstudioRequest request) {
        if (!GRADOS_VALIDOS.contains(request.grado())) {
            throw new IllegalArgumentException("Grado inválido. Valores permitidos: Licenciatura, Maestría, Doctorado");
        }
        if (request.duracionCuatrimestres() == null || request.duracionCuatrimestres() <= 0) {
            throw new IllegalArgumentException("La duración en cuatrimestres debe ser mayor a 0");
        }
    }

    private PlanEstudioResponse toResponse(PlanEstudio p) {
        return new PlanEstudioResponse(
                p.id(), p.nombre(), p.grado(), p.numeroRvoe(),
                p.fechaRvoe(), p.duracionCuatrimestres(),
                p.isActive(), p.createdAt(), p.updatedAt()
        );
    }
}
