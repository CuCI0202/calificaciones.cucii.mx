package mx.cucii.school.platform.dto;

import java.time.LocalDate;

public record PlanEstudioRequest(
        String nombre,
        String grado,
        String numeroRvoe,
        LocalDate fechaRvoe,
        Integer duracionCuatrimestres
) {}
