package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("roles")
public record Rol(
        @Id Integer id,
        String nombre,
        String descripcion,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt
) {}