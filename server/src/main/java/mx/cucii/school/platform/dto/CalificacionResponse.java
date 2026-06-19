package mx.cucii.school.platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CalificacionResponse(
        Integer id,
        Integer alumnoId,
        Integer grupoId,
        Integer materiaId,
        BigDecimal calificacion,
        Integer registradoPor,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
