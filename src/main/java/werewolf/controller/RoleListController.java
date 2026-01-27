package werewolf.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import werewolf.dto.*;
import werewolf.entity.RoleListEntity;
import werewolf.entity.RoleListItemEntity;
import werewolf.model.*;
import werewolf.repository.RoleListRepository;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/role-lists")
@CrossOrigin(origins = "*")
public class RoleListController {

    @Autowired
    private RoleListRepository roleListRepository;

    @GetMapping
    public List<SavedRoleList> getAllRoleLists() {
        List<RoleListEntity> entities = roleListRepository.findAllByOrderByUpdatedAtDesc();
        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public SavedRoleList getRoleList(@PathVariable String id) {
        RoleListEntity entity = roleListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role list not found"));
        return convertToDTO(entity);
    }

    @PostMapping
    public SavedRoleList createRoleList(@RequestBody CreateRoleListRequest request) {
        String id = UUID.randomUUID().toString();
        RoleListEntity entity = new RoleListEntity(id, request.getName(), request.getDescription());

        // Add role items
        if (request.getRoles() != null) {
            for (RoleListItem roleItem : request.getRoles()) {
                RoleListItemEntity itemEntity = new RoleListItemEntity(
                    roleItem.getType(),
                    roleItem.getValue(),
                    roleItem.getCount()
                );
                entity.addRoleItem(itemEntity);
            }
        }

        entity = roleListRepository.save(entity);
        return convertToDTO(entity);
    }

    @PutMapping("/{id}")
    public SavedRoleList updateRoleList(@PathVariable String id, @RequestBody CreateRoleListRequest request) {
        RoleListEntity entity = roleListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role list not found"));

        entity.setName(request.getName());
        entity.setDescription(request.getDescription());

        // Clear and re-add role items
        entity.getRoles().clear();
        if (request.getRoles() != null) {
            for (RoleListItem roleItem : request.getRoles()) {
                RoleListItemEntity itemEntity = new RoleListItemEntity(
                    roleItem.getType(),
                    roleItem.getValue(),
                    roleItem.getCount()
                );
                entity.addRoleItem(itemEntity);
            }
        }

        entity = roleListRepository.save(entity);
        return convertToDTO(entity);
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> deleteRoleList(@PathVariable String id) {
        if (!roleListRepository.existsById(id)) {
            throw new RuntimeException("Role list not found");
        }
        roleListRepository.deleteById(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", true);
        return response;
    }

    @GetMapping("/categories")
    public Map<String, Object> getAvailableCategories() {
        List<String> categoryNames = new ArrayList<>();
        for (RoleCategory category : RoleCategory.values()) {
            categoryNames.add(category.toString());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("categories", categoryNames);
        return response;
    }

    @GetMapping("/roles")
    public Map<String, Object> getAvailableRoles() {
        List<String> roleNames = new ArrayList<>();
        for (Roles role : Roles.values()) {
            // Filter out Pestilence - it's a transformation of Plaguebearer, not a starting role
            if (role != Roles.Pestilence) {
                roleNames.add(role.toString());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("roles", roleNames);
        return response;
    }

    // Helper method to convert entity to DTO
    private SavedRoleList convertToDTO(RoleListEntity entity) {
        List<RoleListItem> roleItems = entity.getRoles().stream()
                .map(itemEntity -> new RoleListItem(
                    itemEntity.getType(),
                    itemEntity.getValue(),
                    itemEntity.getCount()
                ))
                .collect(Collectors.toList());

        return new SavedRoleList(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            roleItems
        );
    }
}
