package mx.cucii.school.platform.dto;

import java.time.OffsetDateTime;

public record MateriaResponse(
        Integer id,
        String nombre,
        String clave,
        Integer creditos,
        Integer cuatrimestre,
        Integer planEstudioId,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
