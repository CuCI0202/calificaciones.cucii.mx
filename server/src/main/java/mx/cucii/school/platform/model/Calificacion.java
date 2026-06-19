package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Table("calificaciones")
public record Calificacion(
        @Id Integer id,
        @Column("alumno_id") Integer alumnoId,
        @Column("grupo_id") Integer grupoId,
        @Column("materia_id") Integer materiaId,
        BigDecimal calificacion,
        @Column("registrado_por") Integer registradoPor,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt
) {}
