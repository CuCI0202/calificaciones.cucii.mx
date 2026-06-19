package mx.cucii.school.platform.controller;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.CalificacionRequest;
import mx.cucii.school.platform.dto.CalificacionResponse;
import mx.cucii.school.platform.service.CalificacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/calificaciones")
@RequiredArgsConstructor
public class CalificacionController {

    private final CalificacionService calificacionService;

    @GetMapping
    public ResponseEntity<List<CalificacionResponse>> getAll() {
        return ResponseEntity.ok(calificacionService.findAll());
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
