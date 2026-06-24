package mx.cucii.school.platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record MateriaResponse(
        Integer id,
        String nombre,
        String clave,
        BigDecimal creditos,
        Integer cuatrimestre,
        Integer planEstudioId,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
