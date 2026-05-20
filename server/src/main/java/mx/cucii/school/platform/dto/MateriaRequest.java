package mx.cucii.school.platform.dto;

public record MateriaRequest(
        String nombre,
        String clave,
        Integer creditos,
        Integer cuatrimestre,
        Integer planEstudioId
) {}
