package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("alumnos_grupos")
public record AlumnoGrupo(
        @Id Integer id,
        @Column("alumno_id") Integer alumnoId,
        @Column("grupo_id") Integer grupoId,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt
) {}
