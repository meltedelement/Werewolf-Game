package werewolf.dto;

import java.util.List;

public class CreateGameRequest {
    private List<String> playerNames;
    private List<String> roleList;

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
}