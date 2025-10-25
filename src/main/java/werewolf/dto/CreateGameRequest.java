package werewolf.dto;

import java.util.List;

public class CreateGameRequest {
    private List<String> playerNames;
    private List<String> roleList; // Deprecated - use roleListItems instead
    private List<RoleListItem> roleListItems; // New format supporting categories

    public CreateGameRequest() {
    }

    public List<String> getPlayerNames() {
        return playerNames;
    }

    public void setPlayerNames(List<String> playerNames) {
        this.playerNames = playerNames;
    }

    public List<String> getRoleList() {
        return roleList;
    }

    public void setRoleList(List<String> roleList) {
        this.roleList = roleList;
    }

    public List<RoleListItem> getRoleListItems() {
        return roleListItems;
    }

    public void setRoleListItems(List<RoleListItem> roleListItems) {
        this.roleListItems = roleListItems;
    }
}