package mx.cucii.school.platform.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record PlanEstudioResponse(
        Integer id,
        String nombre,
        String grado,
        String numeroRvoe,
        LocalDate fechaRvoe,
        Integer duracionCuatrimestres,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
