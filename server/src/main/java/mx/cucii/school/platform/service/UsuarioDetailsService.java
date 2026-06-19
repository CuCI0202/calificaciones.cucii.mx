package mx.cucii.school.platform.service;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.repository.RolJdbcRepository;
import mx.cucii.school.platform.repository.UsuarioJdbcRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioJdbcRepository usuarioRepository;
    private final RolJdbcRepository rolRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        String authority = rolRepository.findById(usuario.rolId())
                .map(rol -> "ROLE_" + rol.nombre().toUpperCase().replace(" ", "_"))
                .orElse("ROLE_UNKNOWN");
        return User.builder()
                .username(usuario.email())
                .password(usuario.passwordHash())
                .authorities(authority)
                .build();
    }
}
