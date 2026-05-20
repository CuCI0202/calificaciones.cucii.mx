package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Table("planes_estudio")
public record PlanEstudio(
        @Id Integer id,
        String nombre,
        String grado,
        @Column("numero_rvoe") String numeroRvoe,
        @Column("fecha_rvoe") LocalDate fechaRvoe,
        @Column("duracion_cuatrimestres") Integer duracionCuatrimestres,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt
) {}
