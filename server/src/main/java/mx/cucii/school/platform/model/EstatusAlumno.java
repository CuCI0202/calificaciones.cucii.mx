package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("estatus_alumnos")
public record EstatusAlumno(
        @Id Integer id,
        String nombre,
        String descripcion,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt
) {}
