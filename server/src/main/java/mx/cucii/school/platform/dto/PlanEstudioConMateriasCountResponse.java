package mx.cucii.school.platform.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record PlanEstudioConMateriasCountResponse(
        Integer id,
        String nombre,
        String grado,
        String numeroRvoe,
        LocalDate fechaRvoe,
        Integer duracionCuatrimestres,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        Integer cantidadMaterias
) {}
