package mx.cucii.school.platform.controller;

import lombok.RequiredArgsConstructor;
import mx.cucii.school.platform.dto.PlantelRequest;
import mx.cucii.school.platform.dto.PlantelResponse;
import mx.cucii.school.platform.service.PlantelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/planteles")
@RequiredArgsConstructor
public class PlantelController {

    private final PlantelService plantelService;

    @GetMapping
    public ResponseEntity<List<PlantelResponse>> getAll() {
        return ResponseEntity.ok(plantelService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlantelResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(plantelService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PlantelResponse> create(@RequestBody PlantelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(plantelService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlantelResponse> update(@PathVariable Integer id,
                                                   @RequestBody PlantelRequest request) {
        return ResponseEntity.ok(plantelService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        plantelService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
