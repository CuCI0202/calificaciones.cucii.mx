package mx.cucii.school.platform.repository;

import mx.cucii.school.platform.model.Usuario;
import org.springframework.data.repository.ListCrudRepository;

import java.util.Optional;

public interface UsuarioRepository extends ListCrudRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);
}