package werewolf.controller;

import org.springframework.web.bind.annotation.*;
import werewolf.dto.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GameController {

    // In-memory storage for games
    private Map<String, GameState> games = new HashMap<>();

    @PostMapping("/game/create")
    public GameResponse createGame(@RequestBody CreateGameRequest request) {
        try {
            // Create a new game (using reflection to work with default package classes)
            Class<?> gameClass = Class.forName("Game");
            Object game = gameClass.getConstructor(boolean.class).newInstance(false);

            // Add players
            java.lang.reflect.Method addPlayerMethod = gameClass.getMethod("addPlayer", String.class);
            for (String playerName : request.getPlayerNames()) {
                addPlayerMethod.invoke(game, playerName);
            }

            // Get the gameRoles list from the game object
            java.lang.reflect.Method getGameRoles = gameClass.getMethod("getGameRoles");
            ArrayList<?> gameRoles = (ArrayList<?>) getGameRoles.invoke(game);

            // Convert role strings to Roles enum and add to game
            Class<?> rolesClass = Class.forName("Roles");
            if (request.getRoleList() != null && !request.getRoleList().isEmpty()) {
                // Use provided role list
                for (String roleName : request.getRoleList()) {
                    Object roleEnum = Enum.valueOf((Class<Enum>) rolesClass, roleName);
                    gameRoles.add(roleEnum);
                }
            } else {
                // If no role list provided, generate random roles
                java.lang.reflect.Method makeRandomRoles = gameClass.getMethod("makeRandomRoles");
                makeRandomRoles.invoke(game);
            }

            // Get players and roles
            java.lang.reflect.Method getPlayers = gameClass.getMethod("getPlayers");
            ArrayList<?> players = (ArrayList<?>) getPlayers.invoke(game);
            ArrayList<?> roles = (ArrayList<?>) getGameRoles.invoke(game);

            // Assign roles to players
            for (int i = 0; i < players.size() && i < roles.size(); i++) {
                Object player = players.get(i);
                Object role = roles.get(i);

                Class<?> playerClass = Class.forName("Player");
                java.lang.reflect.Method setRoles = playerClass.getMethod("setroles", Class.forName("Roles"));
                setRoles.invoke(player, role);
            }

            // Create game ID
            String gameId = UUID.randomUUID().toString();

            // Store game state
            GameState gameState = new GameState(game, players, roles);
            games.put(gameId, gameState);

            // Convert to response DTO
            List<GameResponse.PlayerDTO> playerDTOs = new ArrayList<>();
            for (Object player : players) {
                Class<?> playerClass = Class.forName("Player");
                java.lang.reflect.Field nameField = playerClass.getField("name");
                java.lang.reflect.Method getRole = playerClass.getMethod("getrole");

                String name = (String) nameField.get(player);
                Object role = getRole.invoke(player);
                String roleName = role != null ? role.toString() : "Unassigned";

                playerDTOs.add(new GameResponse.PlayerDTO(name, roleName, true));
            }

            return new GameResponse(gameId, playerDTOs);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create game: " + e.getMessage(), e);
        }
    }

    @GetMapping("/game/{gameId}")
    public GameResponse getGame(@PathVariable String gameId) {
        try {
            GameState gameState = games.get(gameId);
            if (gameState == null) {
                throw new RuntimeException("Game not found");
            }

            ArrayList<?> players = gameState.players;

            // Convert to response DTO
            List<GameResponse.PlayerDTO> playerDTOs = new ArrayList<>();
            Class<?> playerClass = Class.forName("Player");

            for (Object player : players) {
                java.lang.reflect.Field nameField = playerClass.getField("name");
                java.lang.reflect.Method getRole = playerClass.getMethod("getrole");

                String name = (String) nameField.get(player);
                Object role = getRole.invoke(player);
                String roleName = role != null ? role.toString() : "Unassigned";

                playerDTOs.add(new GameResponse.PlayerDTO(name, roleName, true));
            }

            return new GameResponse(gameId, playerDTOs);

        } catch (Exception e) {
            throw new RuntimeException("Failed to get game: " + e.getMessage(), e);
        }
    }

    @PostMapping("/game/{gameId}/night-action")
    public NightActionResponse performNightAction(
            @PathVariable String gameId,
            @RequestBody NightActionRequest request) {
        try {
            GameState gameState = games.get(gameId);
            if (gameState == null) {
                throw new RuntimeException("Game not found");
            }

            // Convert role string to Roles enum
            Class<?> rolesClass = Class.forName("Roles");
            Object roleEnum = Enum.valueOf((Class<Enum>) rolesClass, request.getRole());

            // Call NightActions.performNightAction
            Class<?> nightActionsClass = Class.forName("NightActions");
            java.lang.reflect.Method performAction = nightActionsClass.getMethod("performNightAction", rolesClass);
            Object result = performAction.invoke(null, roleEnum);

            String resultStr = result != null ? result.toString() : "Action performed";

            return new NightActionResponse(true, "Night action completed", resultStr);

        } catch (Exception e) {
            return new NightActionResponse(false, "Failed to perform night action: " + e.getMessage(), null);
        }
    }

    // Helper class to store game state
    private static class GameState {
        Object game;
        ArrayList<?> players;
        ArrayList<?> roles;

        GameState(Object game, ArrayList<?> players, ArrayList<?> roles) {
            this.game = game;
            this.players = players;
            this.roles = roles;
        }
    }
}