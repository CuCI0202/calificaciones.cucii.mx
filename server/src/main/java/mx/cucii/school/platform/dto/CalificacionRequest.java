package mx.cucii.school.platform.dto;

import java.math.BigDecimal;

public record CalificacionRequest(
        Integer alumnoId,
        Integer grupoId,
        Integer materiaId,
        BigDecimal calificacion,
        Integer registradoPor
) {}
