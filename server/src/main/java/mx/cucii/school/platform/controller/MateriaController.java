package mx.cucii.school.platform.controller;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.MateriaRequest;
import mx.cucii.school.platform.dto.MateriaResponse;
import mx.cucii.school.platform.service.MateriaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mx.cucii.school.platform.dto.PageResponse;

@RestController
@RequestMapping("/materias")
@RequiredArgsConstructor
public class MateriaController {

    private final MateriaService materiaService;

    @GetMapping
    public ResponseEntity<PageResponse<MateriaResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(materiaService.findAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MateriaResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(materiaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MateriaResponse> create(@RequestBody MateriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materiaService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MateriaResponse> update(@PathVariable Integer id,
                                                  @RequestBody MateriaRequest request) {
        return ResponseEntity.ok(materiaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        materiaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
