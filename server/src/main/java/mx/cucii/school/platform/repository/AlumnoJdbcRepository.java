package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.Alumno;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class AlumnoJdbcRepository {

    private static final RowMapper<Alumno> ALUMNO_MAPPER = (rs, rowNum) ->
        new Alumno(
                rs.getInt("id"),
                rs.getString("nombres"),
                rs.getString("primer_apellido"),
                rs.getString("segundo_apellido"),
                rs.getString("curp"),
                rs.getString("correo_institucional"),
                rs.getInt("estatus_id"),
                rs.getBoolean("is_active"),
                rs.getObject("created_at", OffsetDateTime.class),
                rs.getObject("updated_at", OffsetDateTime.class)
        );

    private final JdbcTemplate jdbcTemplate;

    public AlumnoJdbcRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Alumno> findAll() {
        return jdbcTemplate.query("SELECT * FROM alumnos", ALUMNO_MAPPER);
    }

    public Optional<Alumno> findById(Integer id) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos WHERE id = ?",
                ALUMNO_MAPPER, id
        ).stream().findFirst();
    }

    public Optional<Alumno> findByCurp(String curp) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos WHERE curp = ?",
                ALUMNO_MAPPER, curp
        ).stream().findFirst();
    }

    public Optional<Alumno> findByCorreoInstitucional(String correo) {
        return jdbcTemplate.query(
                "SELECT * FROM alumnos WHERE correo_institucional = ?",
                ALUMNO_MAPPER, correo
        ).stream().findFirst();
    }

    public Alumno save(Alumno alumno) {
        if (alumno.id() == null) {
            return insert(alumno);
        }
        return update(alumno);
    }

    private Alumno insert(Alumno alumno) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO alumnos (nombres, primer_apellido, segundo_apellido, curp, correo_institucional, estatus_id, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING *
                """,
                ALUMNO_MAPPER,
                alumno.nombres(), alumno.primerApellido(), alumno.segundoApellido(),
                alumno.curp(), alumno.correoInstitucional(), alumno.estatusId(),
                alumno.isActive(), alumno.createdAt(), alumno.updatedAt()
        );
    }

    private Alumno update(Alumno alumno) {
        return jdbcTemplate.queryForObject(
                """
                UPDATE alumnos
                SET nombres = ?, primer_apellido = ?, segundo_apellido = ?, curp = ?,
                    correo_institucional = ?, estatus_id = ?, updated_at = ?
                WHERE id = ?
                RETURNING *
                """,
                ALUMNO_MAPPER,
                alumno.nombres(), alumno.primerApellido(), alumno.segundoApellido(),
                alumno.curp(), alumno.correoInstitucional(), alumno.estatusId(),
                alumno.updatedAt(), alumno.id()
        );
    }

    public void softDeleteById(Integer id, OffsetDateTime now) {
        jdbcTemplate.update(
                "UPDATE alumnos SET is_active = false, updated_at = ? WHERE id = ?",
                now, id
        );
    }
}
