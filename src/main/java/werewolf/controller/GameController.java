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
            @SuppressWarnings("unchecked")
            ArrayList<Object> gameRoles = (ArrayList<Object>) getGameRoles.invoke(game);

            // Convert role strings to Roles enum and add to game
            Class<?> rolesClass = Class.forName("Roles");

            // Check for new format (roleListItems) first, then fall back to old format
            if (request.getRoleListItems() != null && !request.getRoleListItems().isEmpty()) {
                // Use new format with support for categories
                for (werewolf.dto.RoleListItem item : request.getRoleListItems()) {
                    int count = item.getCount() != null ? item.getCount() : 1;

                    for (int i = 0; i < count; i++) {
                        if ("CATEGORY".equals(item.getType())) {
                            // Resolve category to a random role
                            Object randomRole = getRandomRoleFromCategory(item.getValue());
                            gameRoles.add(randomRole);
                        } else {
                            // Specific role
                            Object roleEnum;
                            try {
                                roleEnum = Enum.valueOf((Class<Enum>) rolesClass, item.getValue());
                            } catch (IllegalArgumentException e) {
                                roleEnum = findRoleByName(rolesClass, item.getValue());
                            }
                            gameRoles.add(roleEnum);
                        }
                    }
                }
            } else if (request.getRoleList() != null && !request.getRoleList().isEmpty()) {
                // Use old format (deprecated) for backward compatibility
                for (String roleName : request.getRoleList()) {
                    Object roleEnum;
                    try {
                        roleEnum = Enum.valueOf((Class<Enum>) rolesClass, roleName);
                    } catch (IllegalArgumentException e) {
                        roleEnum = findRoleByName(rolesClass, roleName);
                    }
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

    // Helper method to find role by name (case-insensitive)
    private Object findRoleByName(Class<?> rolesClass, String roleName) throws Exception {
        // Get all enum constants
        Object[] enumConstants = rolesClass.getEnumConstants();

        // Try case-insensitive match
        for (Object enumConstant : enumConstants) {
            if (enumConstant.toString().equalsIgnoreCase(roleName)) {
                return enumConstant;
            }
        }

        // If not found, throw exception
        throw new IllegalArgumentException("No role found matching: " + roleName);
    }

    // Helper method to get a random role from a category
    private Object getRandomRoleFromCategory(String categoryName) throws Exception {
        Class<?> roleListClass = Class.forName("RoleList");
        java.util.Random random = new java.util.Random();

        // Map category name to the appropriate field in RoleList
        String fieldName = categoryName + "_ROLES";

        try {
            java.lang.reflect.Field field = roleListClass.getField(fieldName);
            Object[] roles = (Object[]) field.get(null);

            if (roles.length == 0) {
                throw new IllegalArgumentException("Category " + categoryName + " has no roles");
            }

            // Return a random role from the category
            return roles[random.nextInt(roles.length)];
        } catch (NoSuchFieldException e) {
            throw new IllegalArgumentException("Unknown category: " + categoryName);
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