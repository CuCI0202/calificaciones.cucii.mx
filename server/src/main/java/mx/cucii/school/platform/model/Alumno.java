package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("alumnos")
public record Alumno(
        @Id Integer id,
        String nombres,
        @Column("primer_apellido") String primerApellido,
        @Column("segundo_apellido") String segundoApellido,
        String curp,
        @Column("correo_institucional") String correoInstitucional,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt
) {}
