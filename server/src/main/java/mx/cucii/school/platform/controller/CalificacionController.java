package mx.cucii.school.platform.controller;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.CalificacionRequest;
import mx.cucii.school.platform.dto.CalificacionResponse;
import mx.cucii.school.platform.dto.PageResponse;
import mx.cucii.school.platform.service.CalificacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/calificaciones")
@RequiredArgsConstructor
public class CalificacionController {

    private final CalificacionService calificacionService;

    @GetMapping
    public ResponseEntity<PageResponse<CalificacionResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer alumnoId,
            @RequestParam(required = false) Integer grupoId,
            @RequestParam(required = false) Integer materiaId,
            @RequestParam(required = false) BigDecimal calificacionMin,
            @RequestParam(required = false) BigDecimal calificacionMax,
            @RequestParam(required = false) Integer registradoPor,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(calificacionService.findAll(page, size, alumnoId, grupoId, materiaId, calificacionMin, calificacionMax, registradoPor, isActive, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalificacionResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(calificacionService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CalificacionResponse> create(@RequestBody CalificacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calificacionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalificacionResponse> update(@PathVariable Integer id,
                                                        @RequestBody CalificacionRequest request) {
        return ResponseEntity.ok(calificacionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        calificacionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
