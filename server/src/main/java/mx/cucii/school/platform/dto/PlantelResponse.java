package mx.cucii.school.platform.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PlantelResponse(
        Integer id,
        String nombreOficial,
        String nombreCorto,
        String direccionCalle,
        String direccionNumeroExt,
        String direccionNumeroInt,
        String colonia,
        String codigoPostal,
        String ciudadMunicipio,
        String estado,
        String pais,
        BigDecimal latitud,
        BigDecimal longitud,
        String directorNombre,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
