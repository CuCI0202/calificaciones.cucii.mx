package mx.cucii.school.platform.service;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.LoginRequest;
import mx.cucii.school.platform.dto.LoginResponse;
import mx.cucii.school.platform.dto.MeResponse;
import mx.cucii.school.platform.model.Rol;
import mx.cucii.school.platform.repository.RolJdbcRepository;
import mx.cucii.school.platform.repository.UsuarioJdbcRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioJdbcRepository usuarioRepository;
    private final RolJdbcRepository rolRepository;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("El usuario autenticado ya no existe en los registros"));

        String token = jwtService.generateToken(usuario.email(), usuario.rolId());
        return new LoginResponse(token, usuario.id(), usuario.nombre(), usuario.apellido(), usuario.email(), usuario.rolId());
    }

    public MeResponse me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var usuario = usuarioRepository.findByEmail(email).orElseThrow();
        return new MeResponse(usuario.id(), usuario.nombre(), usuario.apellido(), usuario.email(), usuario.rolId());
    }
}
