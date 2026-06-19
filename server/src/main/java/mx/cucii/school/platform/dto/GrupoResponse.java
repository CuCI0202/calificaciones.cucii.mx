package mx.cucii.school.platform.dto;

import java.time.OffsetDateTime;

public record GrupoResponse(
        Integer id,
        String clave,
        String nombre,
        Integer planEstudioId,
        Integer plantelId,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
