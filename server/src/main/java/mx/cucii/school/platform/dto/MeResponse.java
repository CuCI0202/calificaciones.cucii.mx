package mx.cucii.school.platform.dto;

public record MeResponse(
        Integer id,
        String nombre,
        String apellido,
        String email,
        Integer rolId
) {}
