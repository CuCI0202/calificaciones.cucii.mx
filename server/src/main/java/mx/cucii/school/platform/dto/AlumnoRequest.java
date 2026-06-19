package mx.cucii.school.platform.dto;

public record AlumnoRequest(
        String nombres,
        String primerApellido,
        String segundoApellido,
        String curp,
        String correoInstitucional
) {}
