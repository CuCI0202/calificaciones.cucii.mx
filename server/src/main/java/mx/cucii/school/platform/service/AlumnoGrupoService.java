package mx.cucii.school.platform.service;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.AlumnoGrupoRequest;
import mx.cucii.school.platform.dto.AlumnoGrupoResponse;
import mx.cucii.school.platform.dto.PageResponse;
import mx.cucii.school.platform.exception.ResourceNotFoundException;
import mx.cucii.school.platform.model.AlumnoGrupo;
import mx.cucii.school.platform.repository.AlumnoGrupoJdbcRepository;
import mx.cucii.school.platform.repository.AlumnoJdbcRepository;
import mx.cucii.school.platform.repository.GrupoJdbcRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlumnoGrupoService {

    private final AlumnoGrupoJdbcRepository repository;
    private final AlumnoJdbcRepository alumnoRepository;
    private final GrupoJdbcRepository grupoRepository;

    public PageResponse<AlumnoGrupoResponse> findAll(int page, int size) {
        if (page < 0) throw new IllegalArgumentException("La página no puede ser negativa");
        if (size < 1) throw new IllegalArgumentException("El tamaño de página debe ser al menos 1");
        if (size > 100) throw new IllegalArgumentException("El tamaño de página no puede ser mayor a 100");

        long totalElements = repository.countAll();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int offset = page * size;

        List<AlumnoGrupoResponse> content = repository.findAll(size, offset).stream()
                .map(this::toResponse)
                .toList();

        return new PageResponse<>(content, totalElements, totalPages, page, size);
    }

    public AlumnoGrupoResponse findById(Integer id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación no encontrada: " + id));
    }

    @Transactional
    public AlumnoGrupoResponse create(AlumnoGrupoRequest request) {
        validateRequest(request);

        alumnoRepository.findById(request.alumnoId())
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado: " + request.alumnoId()));
        grupoRepository.findById(request.grupoId())
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado: " + request.grupoId()));

        repository.findByAlumnoIdAndGrupoId(request.alumnoId(), request.grupoId()).ifPresent(a -> {
            throw new IllegalArgumentException("El alumno ya está asignado a este grupo");
        });

        AlumnoGrupo entity = new AlumnoGrupo(
                null,
                request.alumnoId(),
                request.grupoId(),
                true,
                OffsetDateTime.now()
        );
        return toResponse(repository.save(entity));
    }

    @Transactional
    public AlumnoGrupoResponse update(Integer id, AlumnoGrupoRequest request) {
        repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación no encontrada: " + id));
        validateRequest(request);

        alumnoRepository.findById(request.alumnoId())
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado: " + request.alumnoId()));
        grupoRepository.findById(request.grupoId())
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado: " + request.grupoId()));

        AlumnoGrupo updated = new AlumnoGrupo(
                id,
                request.alumnoId(),
                request.grupoId(),
                true,
                null
        );
        return toResponse(repository.save(updated));
    }

    @Transactional
    public void delete(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Asignación no encontrada: " + id);
        }
        repository.softDeleteById(id);
    }

    private void validateRequest(AlumnoGrupoRequest request) {
        if (request.alumnoId() == null) {
            throw new IllegalArgumentException("El alumno es obligatorio");
        }
        if (request.grupoId() == null) {
            throw new IllegalArgumentException("El grupo es obligatorio");
        }
    }

    private AlumnoGrupoResponse toResponse(AlumnoGrupo a) {
        return new AlumnoGrupoResponse(
                a.id(), a.alumnoId(), a.grupoId(),
                a.isActive(), a.createdAt()
        );
    }
}
