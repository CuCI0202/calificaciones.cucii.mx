package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("usuarios")
public record Usuario(
        @Id Integer id,
        String nombre,
        String apellido,
        String email,
        @Column("password_hash") String passwordHash,
        @Column("rol_id") Integer rolId,
        @Column("plantel_id") Integer plantelId,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt
) {}