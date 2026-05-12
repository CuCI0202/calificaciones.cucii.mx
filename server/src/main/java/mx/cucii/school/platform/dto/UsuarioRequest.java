package mx.cucii.school.platform.dto;

public record UsuarioRequest(
        String nombre,
        String email,
        String password,
        Integer rolId,
        Integer plantelId
) {}
