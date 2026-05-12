package mx.cucii.school.platform.service;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.LoginRequest;
import mx.cucii.school.platform.dto.LoginResponse;
import mx.cucii.school.platform.model.Rol;
import mx.cucii.school.platform.repository.RolRepository;
import mx.cucii.school.platform.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var usuario = usuarioRepository.findByEmail(request.email()).orElseThrow();
        String rol = rolRepository.findById(usuario.rolId())
                .map(Rol::nombre)
                .orElse("");
        String token = jwtService.generateToken(usuario.email(), rol);
        return new LoginResponse(token, usuario.nombre(), usuario.email(), rol);
    }
}
