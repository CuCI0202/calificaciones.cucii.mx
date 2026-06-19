package mx.cucii.school.platform.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record PlanEstudioConMateriasResponse(
        Integer id,
        String nombre,
        String grado,
        String numeroRvoe,
        LocalDate fechaRvoe,
        Integer duracionCuatrimestres,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<MateriaResponse> materias
) {}
