package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("grupos")
public record Grupo(
        @Id Integer id,
        String clave,
        String nombre,
        @Column("plan_estudio_id") Integer planEstudioId,
        @Column("plantel_id") Integer plantelId,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt
) {}
