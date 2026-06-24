package mx.cucii.school.platform.dto;

import java.math.BigDecimal;

public record MateriaRequest(
        String nombre,
        String clave,
        BigDecimal creditos,
        Integer cuatrimestre,
        Integer planEstudioId
) {}
