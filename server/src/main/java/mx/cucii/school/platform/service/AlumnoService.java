package mx.cucii.school.platform.service;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.AlumnoRequest;
import mx.cucii.school.platform.dto.AlumnoResponse;
import mx.cucii.school.platform.exception.ResourceNotFoundException;
import mx.cucii.school.platform.model.Alumno;
import mx.cucii.school.platform.repository.AlumnoJdbcRepository;
import mx.cucii.school.platform.repository.EstatusAlumnoJdbcRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlumnoService {

    private static final String CURP_REGEX = "^[A-Z][AEIOUX][A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z][0-9]$";

    private final AlumnoJdbcRepository repository;
    private final EstatusAlumnoJdbcRepository estatusAlumnoRepository;

    public List<AlumnoResponse> findAll() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public AlumnoResponse findById(Integer id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado: " + id));
    }

    @Transactional
    public AlumnoResponse create(AlumnoRequest request) {
        validateRequest(request);

        repository.findByCurp(request.curp()).ifPresent(a -> {
            throw new IllegalArgumentException("El CURP ya está registrado");
        });
        if (request.correoInstitucional() != null && !request.correoInstitucional().isBlank()) {
            repository.findByCorreoInstitucional(request.correoInstitucional()).ifPresent(a -> {
                throw new IllegalArgumentException("El correo institucional ya está registrado");
            });
        }

        OffsetDateTime now = OffsetDateTime.now();
        Alumno alumno = new Alumno(
                null,
                request.nombres(),
                request.primerApellido(),
                request.segundoApellido(),
                request.curp(),
                request.correoInstitucional(),
                request.estatusId(),
                true,
                now,
                now
        );
        return toResponse(repository.save(alumno));
    }

    @Transactional
    public AlumnoResponse update(Integer id, AlumnoRequest request) {
        Alumno existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumno no encontrado: " + id));
        validateRequest(request);

        if (!existing.curp().equals(request.curp())) {
            repository.findByCurp(request.curp()).ifPresent(a -> {
                throw new IllegalArgumentException("El CURP ya está registrado");
            });
        }
        String newCorreo = request.correoInstitucional();
        if (newCorreo != null && !newCorreo.isBlank()
                && !newCorreo.equals(existing.correoInstitucional())) {
            repository.findByCorreoInstitucional(newCorreo).ifPresent(a -> {
                throw new IllegalArgumentException("El correo institucional ya está registrado");
            });
        }

        Alumno updated = new Alumno(
                existing.id(),
                request.nombres(),
                request.primerApellido(),
                request.segundoApellido(),
                request.curp(),
                request.correoInstitucional(),
                request.estatusId(),
                existing.isActive(),
                existing.createdAt(),
                OffsetDateTime.now()
        );
        return toResponse(repository.save(updated));
    }

    @Transactional
    public void delete(Integer id) {
        if (repository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Alumno no encontrado: " + id);
        }
        repository.softDeleteById(id, OffsetDateTime.now());
    }

    private void validateRequest(AlumnoRequest request) {
        if (request.nombres() == null || request.nombres().isBlank()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        if (request.primerApellido() == null || request.primerApellido().isBlank()) {
            throw new IllegalArgumentException("El primer apellido es obligatorio");
        }
        if (request.curp() == null || request.curp().isBlank()) {
            throw new IllegalArgumentException("El CURP es obligatorio");
        }
        if (!request.curp().matches(CURP_REGEX)) {
            throw new IllegalArgumentException("El formato del CURP es inválido");
        }
        if (request.estatusId() == null) {
            throw new IllegalArgumentException("El estatus del alumno es obligatorio");
        }
        if (!estatusAlumnoRepository.existsById(request.estatusId())) {
            throw new IllegalArgumentException("El estatus del alumno no es válido");
        }
    }

    private AlumnoResponse toResponse(Alumno a) {
        return new AlumnoResponse(
                a.id(), a.nombres(), a.primerApellido(), a.segundoApellido(),
                a.curp(), a.correoInstitucional(), a.estatusId(),
                a.isActive(), a.createdAt(), a.updatedAt()
        );
    }
}
