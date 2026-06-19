package mx.cucii.school.platform.dto;

import java.time.OffsetDateTime;

public record ProfesorGrupoResponse(
        Integer id,
        Integer usuarioId,
        Integer grupoId,
        Integer materiaId,
        boolean isActive,
        OffsetDateTime createdAt
) {}
