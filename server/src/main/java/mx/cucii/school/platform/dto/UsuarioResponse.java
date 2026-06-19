package mx.cucii.school.platform.dto;

import java.time.OffsetDateTime;

public record UsuarioResponse(
        Integer id,
        String nombre,
        String apellido,
        String email,
        Integer rolId,
        String rolNombre,
        Integer plantelId,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
