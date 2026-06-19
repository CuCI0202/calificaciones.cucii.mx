package mx.cucii.school.platform.dto;

public record ProfesorGrupoRequest(
        Integer usuarioId,
        Integer grupoId,
        Integer materiaId
) {}
