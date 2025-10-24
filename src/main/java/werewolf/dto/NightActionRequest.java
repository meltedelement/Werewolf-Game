package werewolf.dto;

import java.util.List;

public class NightActionRequest {
    private String role;
    private List<String> targetNames;

    public NightActionRequest() {
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getTargetNames() {
        return targetNames;
    }

    public void setTargetNames(List<String> targetNames) {
        this.targetNames = targetNames;
    }
}