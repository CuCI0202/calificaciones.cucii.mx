package mx.cucii.school.platform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Table("planteles")
public record Plantel(
        @Id Integer id,
        @Column("nombre_oficial") String nombreOficial,
        @Column("nombre_corto") String nombreCorto,
        @Column("direccion_calle") String direccionCalle,
        @Column("direccion_numero_ext") String direccionNumeroExt,
        @Column("direccion_numero_int") String direccionNumeroInt,
        String colonia,
        @Column("codigo_postal") String codigoPostal,
        @Column("ciudad_municipio") String ciudadMunicipio,
        String estado,
        String pais,
        BigDecimal latitud,
        BigDecimal longitud,
        @Column("director_nombre") String directorNombre,
        @Column("is_active") boolean isActive,
        @Column("created_at") OffsetDateTime createdAt,
        @Column("updated_at") OffsetDateTime updatedAt
) {}
