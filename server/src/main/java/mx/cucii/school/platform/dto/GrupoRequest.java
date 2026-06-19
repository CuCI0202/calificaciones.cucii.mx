package mx.cucii.school.platform.dto;

public record GrupoRequest(
        String clave,
        String nombre,
        Integer planEstudioId,
        Integer plantelId
) {}
