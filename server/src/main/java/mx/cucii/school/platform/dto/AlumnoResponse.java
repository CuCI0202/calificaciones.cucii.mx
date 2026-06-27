package mx.cucii.school.platform.dto;

import java.time.OffsetDateTime;

public record AlumnoResponse(
        Integer id,
        String nombres,
        String primerApellido,
        String segundoApellido,
        String curp,
        String correoInstitucional,
        Integer estatusId,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
