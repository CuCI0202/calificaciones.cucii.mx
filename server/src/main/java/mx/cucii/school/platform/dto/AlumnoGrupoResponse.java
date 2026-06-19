package mx.cucii.school.platform.dto;

import java.time.OffsetDateTime;

public record AlumnoGrupoResponse(
        Integer id,
        Integer alumnoId,
        Integer grupoId,
        boolean isActive,
        OffsetDateTime createdAt
) {}
