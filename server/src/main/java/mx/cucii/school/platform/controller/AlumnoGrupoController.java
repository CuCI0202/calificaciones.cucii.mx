package mx.cucii.school.platform.controller;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.AlumnoGrupoRequest;
import mx.cucii.school.platform.dto.AlumnoGrupoResponse;
import mx.cucii.school.platform.service.AlumnoGrupoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mx.cucii.school.platform.dto.PageResponse;

@RestController
@RequestMapping("/alumnos-grupos")
@RequiredArgsConstructor
public class AlumnoGrupoController {

    private final AlumnoGrupoService alumnoGrupoService;

    @GetMapping
    public ResponseEntity<PageResponse<AlumnoGrupoResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alumnoGrupoService.findAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlumnoGrupoResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(alumnoGrupoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AlumnoGrupoResponse> create(@RequestBody AlumnoGrupoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alumnoGrupoService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlumnoGrupoResponse> update(@PathVariable Integer id,
                                                       @RequestBody AlumnoGrupoRequest request) {
        return ResponseEntity.ok(alumnoGrupoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        alumnoGrupoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
