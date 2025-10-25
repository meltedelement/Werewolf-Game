package werewolf.controller;

import org.springframework.web.bind.annotation.*;
import werewolf.dto.*;

import java.util.*;

@RestController
@RequestMapping("/api/role-lists")
@CrossOrigin(origins = "*")
public class RoleListController {

    // In-memory storage for role lists
    private Map<String, SavedRoleList> roleLists = new HashMap<>();

    @GetMapping
    public List<SavedRoleList> getAllRoleLists() {
        return new ArrayList<>(roleLists.values());
    }

    @GetMapping("/{id}")
    public SavedRoleList getRoleList(@PathVariable String id) {
        SavedRoleList roleList = roleLists.get(id);
        if (roleList == null) {
            throw new RuntimeException("Role list not found");
        }
        return roleList;
    }

    @PostMapping
    public SavedRoleList createRoleList(@RequestBody CreateRoleListRequest request) {
        String id = UUID.randomUUID().toString();
        SavedRoleList roleList = new SavedRoleList(
            id,
            request.getName(),
            request.getDescription(),
            request.getRoles()
        );
        roleLists.put(id, roleList);
        return roleList;
    }

    @PutMapping("/{id}")
    public SavedRoleList updateRoleList(@PathVariable String id, @RequestBody CreateRoleListRequest request) {
        if (!roleLists.containsKey(id)) {
            throw new RuntimeException("Role list not found");
        }
        SavedRoleList roleList = new SavedRoleList(
            id,
            request.getName(),
            request.getDescription(),
            request.getRoles()
        );
        roleLists.put(id, roleList);
        return roleList;
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> deleteRoleList(@PathVariable String id) {
        if (!roleLists.containsKey(id)) {
            throw new RuntimeException("Role list not found");
        }
        roleLists.remove(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", true);
        return response;
    }

    @GetMapping("/categories")
    public Map<String, Object> getAvailableCategories() {
        try {
            Class<?> roleCategoryClass = Class.forName("RoleCategory");
            Object[] categories = roleCategoryClass.getEnumConstants();

            List<String> categoryNames = new ArrayList<>();
            for (Object category : categories) {
                categoryNames.add(category.toString());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("categories", categoryNames);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get categories: " + e.getMessage(), e);
        }
    }

    @GetMapping("/roles")
    public Map<String, Object> getAvailableRoles() {
        try {
            Class<?> rolesClass = Class.forName("Roles");
            Object[] roles = rolesClass.getEnumConstants();

            List<String> roleNames = new ArrayList<>();
            for (Object role : roles) {
                roleNames.add(role.toString());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("roles", roleNames);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to get roles: " + e.getMessage(), e);
        }
    }
}
