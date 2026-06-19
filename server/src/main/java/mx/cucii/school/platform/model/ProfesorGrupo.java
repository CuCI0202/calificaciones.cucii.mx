package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("profesores_grupos")
public record ProfesorGrupo(
        @Id Integer id,
        @Column("usuario_id") Integer usuarioId,
        @Column("grupo_id") Integer grupoId,
        @Column("materia_id") Integer materiaId,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt
) {}
