package mx.cucii.school.platform.controller;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.ProfesorGrupoRequest;
import mx.cucii.school.platform.dto.ProfesorGrupoResponse;
import mx.cucii.school.platform.service.ProfesorGrupoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profesores-grupos")
@RequiredArgsConstructor
public class ProfesorGrupoController {

    private final ProfesorGrupoService profesorGrupoService;

    @GetMapping
    public ResponseEntity<List<ProfesorGrupoResponse>> getAll() {
        return ResponseEntity.ok(profesorGrupoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfesorGrupoResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(profesorGrupoService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProfesorGrupoResponse> create(@RequestBody ProfesorGrupoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profesorGrupoService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfesorGrupoResponse> update(@PathVariable Integer id,
                                                         @RequestBody ProfesorGrupoRequest request) {
        return ResponseEntity.ok(profesorGrupoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        profesorGrupoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
