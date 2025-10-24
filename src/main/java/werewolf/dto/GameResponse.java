package werewolf.dto;

import java.util.List;
import java.util.stream.Collectors;

public class GameResponse {
    private String gameId;
    private List<PlayerDTO> players;

    public GameResponse() {
    }

    public GameResponse(String gameId, List<PlayerDTO> players) {
        this.gameId = gameId;
        this.players = players;
    }

    public String getGameId() {
        return gameId;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public List<PlayerDTO> getPlayers() {
        return players;
    }

    public void setPlayers(List<PlayerDTO> players) {
        this.players = players;
    }

    public static class PlayerDTO {
        private String name;
        private String role;
        private boolean alive;

        public PlayerDTO() {
        }

        public PlayerDTO(String name, String role, boolean alive) {
            this.name = name;
            this.role = role;
            this.alive = alive;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public boolean isAlive() {
            return alive;
        }

        public void setAlive(boolean alive) {
            this.alive = alive;
        }
    }
}