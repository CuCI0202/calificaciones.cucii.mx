package mx.cucii.school.platform.dto;

public record LoginResponse(String token, Integer id, String nombre, String apellido, String email, Integer rolId) {}
