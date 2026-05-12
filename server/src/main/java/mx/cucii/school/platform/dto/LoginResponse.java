package mx.cucii.school.platform.dto;

public record LoginResponse(String token, String nombre, String email, String rol) {}
