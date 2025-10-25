package werewolf.dto;

import java.util.List;

public class CreateRoleListRequest {
    private String name;
    private String description;
    private List<RoleListItem> roles;

    public CreateRoleListRequest() {}

    public CreateRoleListRequest(String name, String description, List<RoleListItem> roles) {
        this.name = name;
        this.description = description;
        this.roles = roles;
    }

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<RoleListItem> getRoles() {
        return roles;
    }

    public void setRoles(List<RoleListItem> roles) {
        this.roles = roles;
    }
}
