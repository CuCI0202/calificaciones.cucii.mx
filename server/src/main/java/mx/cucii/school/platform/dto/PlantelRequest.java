package mx.cucii.school.platform.dto;

import java.math.BigDecimal;

public record PlantelRequest(
        String nombreOficial,
        String nombreCorto,
        String direccionCalle,
        String direccionNumeroExt,
        String direccionNumeroInt,
        String colonia,
        String codigoPostal,
        String ciudadMunicipio,
        String estado,
        String pais,
        BigDecimal latitud,
        BigDecimal longitud,
        String directorNombre
) {}
