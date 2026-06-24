package mx.cucii.school.platform.controller;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.PlanEstudioConMateriasCountResponse;
import mx.cucii.school.platform.dto.PlanEstudioConMateriasResponse;
import mx.cucii.school.platform.dto.PlanEstudioRequest;
import mx.cucii.school.platform.dto.PlanEstudioResponse;
import mx.cucii.school.platform.service.PlanEstudioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planes-estudio")
@RequiredArgsConstructor
public class PlanEstudioController {

    private final PlanEstudioService planEstudioService;

    @GetMapping
    public ResponseEntity<List<PlanEstudioResponse>> getAll() {
        return ResponseEntity.ok(planEstudioService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanEstudioResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(planEstudioService.findById(id));
    }

    @GetMapping("/{id}/con-materias")
    public ResponseEntity<PlanEstudioConMateriasResponse> getByIdWithMaterias(@PathVariable Integer id) {
        return ResponseEntity.ok(planEstudioService.findByIdWithMaterias(id));
    }

    @GetMapping("/con-materias-count")
    public ResponseEntity<List<PlanEstudioConMateriasCountResponse>> getAllWithMateriasCount() {
        return ResponseEntity.ok(planEstudioService.findAllWithMateriasCount());
    }

    @GetMapping("/{id}/con-materias-count")
    public ResponseEntity<PlanEstudioConMateriasCountResponse> getByIdWithMateriasCount(@PathVariable Integer id) {
        return ResponseEntity.ok(planEstudioService.findByIdWithMateriasCount(id));
    }

    @PostMapping
    public ResponseEntity<PlanEstudioResponse> create(@RequestBody PlanEstudioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planEstudioService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanEstudioResponse> update(@PathVariable Integer id,
                                                      @RequestBody PlanEstudioRequest request) {
        return ResponseEntity.ok(planEstudioService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        planEstudioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
