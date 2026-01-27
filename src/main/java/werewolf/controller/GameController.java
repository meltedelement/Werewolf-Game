package werewolf.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import werewolf.dto.*;
import werewolf.model.*;
import werewolf.service.NightActionResolver;
import werewolf.service.WakeupOrderCalculator;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GameController {

    private static final Logger logger = LoggerFactory.getLogger(GameController.class);

    // In-memory storage for games
    private Map<String, GameState> games = new HashMap<>();
    private Random random = new Random();

    /**
     * Create a game with manually assigned roles (for in-person card games)
     */
    @PostMapping("/game/create-with-roles")
    public GameResponse createGameWithRoles(@RequestBody CreateGameWithRolesRequest request) {
        try {
            // Validate that all players have roles assigned
            if (request.getPlayers() == null || request.getPlayers().isEmpty()) {
                throw new RuntimeException("Players list cannot be empty");
            }

            ArrayList<Player> players = new ArrayList<>();
            ArrayList<Roles> gameRoles = new ArrayList<>();

            // Create players with their manually assigned roles
            for (CreateGameWithRolesRequest.PlayerRoleAssignment assignment : request.getPlayers()) {
                if (assignment.getName() == null || assignment.getName().trim().isEmpty()) {
                    throw new RuntimeException("Player name cannot be empty");
                }
                if (assignment.getRole() == null || assignment.getRole().trim().isEmpty()) {
                    throw new RuntimeException("Role must be assigned for player: " + assignment.getName());
                }

                // Find the role
                Roles role = findRoleByName(assignment.getRole());

                // Create player with role
                Player player = new Player(assignment.getName());
                player.role = role;

                players.add(player);
                gameRoles.add(role);
            }

            // Validate no duplicate roles (except Villager)
            validateNoDuplicateRoles(gameRoles);

            // Create game ID
            String gameId = UUID.randomUUID().toString();

            // Store game state
            GameState gameState = new GameState(players, gameRoles);
            games.put(gameId, gameState);

            // Convert to response DTO
            List<GameResponse.PlayerDTO> playerDTOs = new ArrayList<>();
            for (Player player : players) {
                String name = player.name;
                String roleName = player.getrole() != null ? player.getrole().toString() : "Unassigned";
                playerDTOs.add(new GameResponse.PlayerDTO(name, roleName, true));
            }

            return new GameResponse(gameId, playerDTOs);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create game: " + e.getMessage(), e);
        }
    }

    @PostMapping("/game/create")
    public GameResponse createGame(@RequestBody CreateGameRequest request) {
        try {
            // Create players
            ArrayList<Player> players = new ArrayList<>();
            for (String playerName : request.getPlayerNames()) {
                players.add(new Player(playerName));
            }

            // Generate or use provided roles
            ArrayList<Roles> gameRoles = new ArrayList<>();
            List<RoleListItem> originalRoleList = null;

            // Check for new format (roleListItems) first, then fall back to old format
            if (request.getRoleListItems() != null && !request.getRoleListItems().isEmpty()) {
                // Save original role list for intelligent skipping
                originalRoleList = new ArrayList<>(request.getRoleListItems());

                // Track used roles to prevent duplicates (except Villager)
                Set<Roles> usedRoles = new HashSet<>();

                // Use new format with support for categories
                for (RoleListItem item : request.getRoleListItems()) {
                    int count = item.getCount() != null ? item.getCount() : 1;

                    for (int i = 0; i < count; i++) {
                        if ("CATEGORY".equals(item.getType())) {
                            // Resolve category to a random role, avoiding duplicates
                            Roles randomRole = getRandomRoleFromCategory(item.getValue(), usedRoles);
                            gameRoles.add(randomRole);
                            // Track non-Villager roles to prevent duplicates
                            if (randomRole != Roles.Villager) {
                                usedRoles.add(randomRole);
                            }
                        } else {
                            // Specific role
                            Roles role = findRoleByName(item.getValue());
                            gameRoles.add(role);
                            // Track non-Villager roles to prevent duplicates
                            if (role != Roles.Villager) {
                                usedRoles.add(role);
                            }
                        }
                    }
                }
            } else if (request.getRoleList() != null && !request.getRoleList().isEmpty()) {
                // Use old format (deprecated) for backward compatibility
                for (String roleName : request.getRoleList()) {
                    Roles role = findRoleByName(roleName);
                    gameRoles.add(role);
                }
            } else {
                // If no role list provided, generate random roles
                gameRoles = generateRandomRoles(players.size());
            }

            // Validate no duplicate roles (except Villager)
            validateNoDuplicateRoles(gameRoles);

            // Shuffle roles for randomness
            Collections.shuffle(gameRoles);

            // Assign roles to players
            for (int i = 0; i < players.size() && i < gameRoles.size(); i++) {
                players.get(i).role = gameRoles.get(i);
            }

            // Create game ID
            String gameId = UUID.randomUUID().toString();

            // Store game state with original role list
            GameState gameState = new GameState(players, gameRoles, originalRoleList);
            games.put(gameId, gameState);

            // Convert to response DTO
            List<GameResponse.PlayerDTO> playerDTOs = new ArrayList<>();
            for (Player player : players) {
                String name = player.name;
                String roleName = player.getrole() != null ? player.getrole().toString() : "Unassigned";
                playerDTOs.add(new GameResponse.PlayerDTO(name, roleName, true));
            }

            return new GameResponse(gameId, playerDTOs);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create game: " + e.getMessage(), e);
        }
    }

    @GetMapping("/game/{gameId}")
    public GameResponse getGame(@PathVariable String gameId) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        // Convert to response DTO
        List<GameResponse.PlayerDTO> playerDTOs = new ArrayList<>();
        for (Player player : gameState.players) {
            String name = player.name;
            String roleName = player.getrole() != null ? player.getrole().toString() : "Unassigned";
            playerDTOs.add(new GameResponse.PlayerDTO(name, roleName, true));
        }

        return new GameResponse(gameId, playerDTOs);
    }

    /**
     * Get the full game state for the GM interface
     */
    @GetMapping("/game/{gameId}/state")
    public GameStateResponse getGameState(@PathVariable String gameId) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        // Convert players to DTOs
        List<GameStateResponse.PlayerStateDTO> playerDTOs = new ArrayList<>();
        for (Player player : gameState.players) {
            playerDTOs.add(new GameStateResponse.PlayerStateDTO(
                player.name,
                player.getrole() != null ? player.getrole().toString() : "Unknown",
                player.isAlive(),
                player.isHexed(),
                player.isDoused(),
                player.isInfected(),
                player.isProtected(),
                player.isRoleBlocked(),
                player.isSilenced(),
                player.getCupidLinkedTo(),
                player.getWitchProtectionsLeft(),
                player.getWitchKillsLeft(),
                player.getWitchInvestigationsLeft(),
                player.getVeteranAlertsLeft(),
                player.getVigilanteKillsLeft(),
                player.isDeputyShotUsed()
            ));
        }

        // Convert pending actions to DTOs
        List<GameStateResponse.PendingActionDTO> actionDTOs = new ArrayList<>();
        for (NightAction action : gameState.pendingActions) {
            actionDTOs.add(new GameStateResponse.PendingActionDTO(
                action.getActionId(),
                action.getRole() != null ? action.getRole().toString() : "Unknown",
                action.getActorName(),
                action.getActionType() != null ? action.getActionType().toString() : "Unknown",
                action.getTargetNames()
            ));
        }

        return new GameStateResponse(
            gameId,
            gameState.currentPhase,
            gameState.dayNumber,
            gameState.nightNumber,
            playerDTOs,
            actionDTOs,
            gameState.mistWolfAlive,
            gameState.cubwolfDiedLastNight
        );
    }

    /**
     * Get the wakeup order for the current night with intelligent role skipping
     */
    @GetMapping("/game/{gameId}/wakeup-order")
    public Map<String, Object> getWakeupOrder(@PathVariable String gameId) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        // Calculate wakeup order with intelligent skipping
        List<String> wakeupOrder = WakeupOrderCalculator.calculateWakeupOrder(
            gameState.nightNumber,
            gameState.players,
            gameState.roles,
            gameState.originalRoleList,
            gameState.mistWolfAlive
        );

        Map<String, Object> response = new HashMap<>();
        response.put("wakeupOrder", wakeupOrder);
        response.put("nightNumber", gameState.nightNumber);
        return response;
    }

    /**
     * Start a new night phase (transition from Day to Night)
     */
    @PostMapping("/game/{gameId}/start-night")
    public GameStateResponse startNight(@PathVariable String gameId) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        if (gameState.currentPhase != GamePhase.DAY) {
            throw new RuntimeException("Can only start night from day phase. Current phase: " + gameState.currentPhase);
        }

        gameState.advanceToNight();
        return getGameState(gameId);
    }

    /**
     * Submit a night action (queued for later resolution)
     */
    @PostMapping("/game/{gameId}/submit-action")
    public Map<String, Object> submitNightAction(
            @PathVariable String gameId,
            @RequestBody SubmitNightActionRequest request) {
        logger.info("=== SUBMIT NIGHT ACTION START ===");
        logger.info("Game ID: {}", gameId);
        logger.info("Role: {}, Actor: {}, Action Type: {}",
            request.getRole(), request.getActorName(), request.getActionType());
        logger.info("Targets: {}", request.getTargets());

        GameState gameState = games.get(gameId);
        if (gameState == null) {
            logger.error("Game not found: {}", gameId);
            throw new RuntimeException("Game not found");
        }

        logger.info("Game state - Phase: {}, Night: {}, Pending actions: {}",
            gameState.currentPhase, gameState.nightNumber, gameState.pendingActions.size());

        // Validate current phase
        if (gameState.currentPhase != GamePhase.NIGHT_ONE && gameState.currentPhase != GamePhase.NIGHT) {
            logger.error("Invalid phase for night action. Current: {}", gameState.currentPhase);
            throw new RuntimeException("Can only submit actions during night phase. Current phase: " + gameState.currentPhase);
        }

        // Create night action
        Roles role = Roles.valueOf(request.getRole());
        ActionType actionType = ActionType.valueOf(request.getActionType());
        NightAction action = new NightAction(role, request.getActorName(), actionType);

        if (request.getTargets() != null) {
            action.setTargetNames(request.getTargets());
        }

        if (request.getMetadata() != null) {
            action.setMetadata(request.getMetadata());
        }

        // Add to queue
        gameState.addAction(action);
        logger.info("Action queued successfully. Total pending actions: {}", gameState.pendingActions.size());

        // Return action ID for undo capability
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("actionId", action.getActionId());
        response.put("message", "Action queued for resolution");

        // For investigation actions, process immediately and return result
        try {
            String investigationResult = NightActionResolver.processInvestigationImmediate(
                action,
                gameState.players,
                gameState.pendingActions
            );

            if (investigationResult != null) {
                logger.info("Investigation result: {}", investigationResult);
                response.put("investigationResult", investigationResult);
            }
        } catch (Exception e) {
            logger.error("Error processing investigation immediately", e);
            // Don't fail the whole request if investigation processing fails
        }

        logger.info("=== SUBMIT NIGHT ACTION END ===");
        return response;
    }

    /**
     * Undo a submitted action (remove from queue)
     */
    @PostMapping("/game/{gameId}/undo-action/{actionId}")
    public Map<String, Object> undoAction(
            @PathVariable String gameId,
            @PathVariable String actionId) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        boolean removed = gameState.removeAction(actionId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", removed);
        response.put("message", removed ? "Action undone" : "Action not found");
        return response;
    }

    /**
     * Resolve the night phase - process all queued actions and determine outcomes
     * TODO: This is a placeholder - actual resolution logic will be implemented in Phase 3
     */
    @PostMapping("/game/{gameId}/resolve-night")
    public ResolveNightResponse resolveNight(@PathVariable String gameId) {
        logger.info("=== RESOLVE NIGHT START ===");
        logger.info("Game ID: {}", gameId);

        GameState gameState = games.get(gameId);
        if (gameState == null) {
            logger.error("Game not found: {}", gameId);
            throw new RuntimeException("Game not found");
        }

        logger.info("Game state - Phase: {}, Night: {}, Pending actions: {}",
            gameState.currentPhase, gameState.nightNumber, gameState.pendingActions.size());

        if (gameState.currentPhase != GamePhase.NIGHT_ONE && gameState.currentPhase != GamePhase.NIGHT) {
            logger.error("Invalid phase for resolve night. Current: {}", gameState.currentPhase);
            throw new RuntimeException("Can only resolve night during night phase. Current phase: " + gameState.currentPhase);
        }

        // Log all pending actions
        logger.info("Pending actions to resolve:");
        for (int i = 0; i < gameState.pendingActions.size(); i++) {
            NightAction action = gameState.pendingActions.get(i);
            logger.info("  {}. {} ({}) - {} targeting {}",
                i + 1, action.getRole(), action.getActorName(),
                action.getActionType(), action.getTargetNames());
        }

        // Use NightActionResolver to process all actions
        NightActionResolver resolver = new NightActionResolver(
            gameState.players,
            gameState.pendingActions,
            gameState.mistWolfAlive,
            gameState.cubwolfDiedLastNight,
            gameState.nightNumber
        );

        logger.info("Starting night resolution...");
        ResolveNightResponse response = resolver.resolve();
        logger.info("Night resolution complete. Deaths: {}, Status changes: {}",
            response.getDeaths().size(), response.getStatusChanges().size());

        // Update Mistwolf status based on deaths
        updateMistwolfStatus(gameState);

        // Update Cubwolf status - set for next night if Cubwolf died this night
        if (response.getCubwolfDiedThisNight() != null) {
            gameState.cubwolfDiedLastNight = response.getCubwolfDiedThisNight();
        } else {
            // Reset if it was used this night
            gameState.cubwolfDiedLastNight = null;
        }

        // Clear pending actions after resolution
        gameState.pendingActions.clear();

        // Add resolved actions to history
        gameState.actionHistory.add("Night " + gameState.nightNumber + " resolved with " +
            response.getDeaths().size() + " deaths");

        // Transition to day phase
        gameState.advanceToDay();

        return response;
    }

    /**
     * Resolve the day phase - handle lynch and special day actions
     */
    @PostMapping("/game/{gameId}/resolve-day")
    public Map<String, Object> resolveDay(
            @PathVariable String gameId,
            @RequestBody ResolveLynchRequest request) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        if (gameState.currentPhase != GamePhase.DAY) {
            throw new RuntimeException("Can only resolve day during day phase. Current phase: " + gameState.currentPhase);
        }

        Map<String, Object> response = new HashMap<>();
        List<String> events = new ArrayList<>();

        // Process lynch
        if (request.getLynchedPlayerName() != null && !request.getLynchedPlayerName().isEmpty()) {
            Player lynchedPlayer = gameState.getPlayerByName(request.getLynchedPlayerName());
            if (lynchedPlayer == null) {
                throw new RuntimeException("Player not found: " + request.getLynchedPlayerName());
            }

            if (!lynchedPlayer.isAlive()) {
                throw new RuntimeException("Cannot lynch a dead player: " + request.getLynchedPlayerName());
            }

            // Kill the player
            lynchedPlayer.kill();
            String role = gameState.mistWolfAlive ? "Hidden" : lynchedPlayer.getrole().toString();
            events.add(request.getLynchedPlayerName() + " was lynched. Role: " + role);

            // Handle special lynch mechanics

            // Tanner gets revenge kill if lynched (and is marked as winner)
            if (lynchedPlayer.getrole() == Roles.Tanner) {
                events.add("🎉 TANNER CONDITION MET! " + request.getLynchedPlayerName() + " (Tanner) was lynched and gets a revenge kill!");
                response.put("tannerRevenge", true);
                response.put("tannerName", request.getLynchedPlayerName());
                response.put("tannerWon", true); // Track for end-game scoring
                // Game continues - Tanner gets to kill someone
            }

            // Check if any Executioner's target was lynched
            for (Player player : gameState.players) {
                if (player.getrole() == Roles.Executioner && player.isAlive()) {
                    if (request.getLynchedPlayerName().equals(player.getExecutionerTarget())) {
                        events.add("🎉 EXECUTIONER WINS! " + player.name + " (Executioner) successfully got their target lynched!");
                        response.put("executionerWin", true);
                        response.put("executionerName", player.name);
                    }
                }
            }

            // Hunter gets revenge kill
            if (lynchedPlayer.getrole() == Roles.Hunter) {
                events.add("⚠️ " + request.getLynchedPlayerName() + " was a Hunter! They get a revenge kill.");
                response.put("hunterRevenge", true);
                response.put("hunterName", request.getLynchedPlayerName());
                // Frontend will need to prompt for revenge target
            }

            // Check Cupid links
            if (lynchedPlayer.getCupidLinkedTo() != null) {
                Player linked = gameState.getPlayerByName(lynchedPlayer.getCupidLinkedTo());
                if (linked != null && linked.isAlive()) {
                    linked.kill();
                    String linkedRole = gameState.mistWolfAlive ? "Hidden" : linked.getrole().toString();
                    events.add("💔 " + linked.name + " died due to Cupid link with " + request.getLynchedPlayerName() + ". Role: " + linkedRole);

                    // Check if linked player was also a Hunter
                    if (linked.getrole() == Roles.Hunter) {
                        events.add("⚠️ " + linked.name + " was a Hunter! They also get a revenge kill.");
                        response.put("linkedHunterRevenge", true);
                        response.put("linkedHunterName", linked.name);
                    }
                }
            }

            response.put("lynched", request.getLynchedPlayerName());
            response.put("role", role);
        } else {
            events.add("No one was lynched (tie or no majority)");
            response.put("lynched", null);
        }

        // Update Mistwolf status in case they were lynched
        gameState.updateMistWolfStatus();

        // TODO Phase 3: Check win conditions here
        // For now, just continue to next night

        response.put("success", true);
        response.put("events", events);
        response.put("message", "Day resolved. Ready to start next night.");

        return response;
    }

    /**
     * Deputy shoots a player during the day
     */
    @PostMapping("/game/{gameId}/deputy-shoot")
    public Map<String, Object> deputyShoot(
            @PathVariable String gameId,
            @RequestBody Map<String, String> request) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        if (gameState.currentPhase != GamePhase.DAY) {
            throw new RuntimeException("Deputy can only shoot during day phase");
        }

        String targetName = request.get("targetName");
        if (targetName == null || targetName.isEmpty()) {
            throw new RuntimeException("Target name is required");
        }

        // Find the deputy
        Player deputy = null;
        for (Player player : gameState.players) {
            if (player.getrole() == Roles.Deputy && player.isAlive()) {
                deputy = player;
                break;
            }
        }

        if (deputy == null) {
            throw new RuntimeException("No alive Deputy in this game");
        }

        // Check if Deputy has already used their one shot
        if (deputy.isDeputyShotUsed()) {
            throw new RuntimeException("Deputy has already used their one shot");
        }

        // Mark shot as used
        deputy.setDeputyShotUsed(true);

        // Find the target
        Player target = gameState.getPlayerByName(targetName);
        if (target == null) {
            throw new RuntimeException("Target player not found: " + targetName);
        }

        if (!target.isAlive()) {
            throw new RuntimeException("Cannot shoot a dead player");
        }

        Map<String, Object> response = new HashMap<>();
        List<String> events = new ArrayList<>();

        // Kill the target
        target.kill();
        String targetRole = gameState.mistWolfAlive ? "Hidden" : target.getrole().toString();
        events.add(deputy.name + " (Deputy) shot " + targetName + ". Role: " + targetRole);

        // Check if Deputy shot a town member
        boolean targetWasTown = isTownAligned(target);
        if (targetWasTown) {
            // Deputy dies for shooting town
            deputy.kill();
            events.add(deputy.name + " (Deputy) committed suicide for shooting a town member");
            response.put("deputySuicide", true);
        }

        // Check if target was Hunter
        if (target.getrole() == Roles.Hunter) {
            events.add("⚠️ " + targetName + " was a Hunter! They get a revenge kill.");
            response.put("hunterRevenge", true);
            response.put("hunterName", targetName);
        }

        // Check Cupid links for the target
        if (target.getCupidLinkedTo() != null) {
            Player linked = gameState.getPlayerByName(target.getCupidLinkedTo());
            if (linked != null && linked.isAlive()) {
                linked.kill();
                String linkedRole = gameState.mistWolfAlive ? "Hidden" : linked.getrole().toString();
                events.add("💔 " + linked.name + " died due to Cupid link. Role: " + linkedRole);

                if (linked.getrole() == Roles.Hunter) {
                    events.add("⚠️ " + linked.name + " was also a Hunter! They get a revenge kill.");
                    response.put("linkedHunterRevenge", true);
                    response.put("linkedHunterName", linked.name);
                }
            }
        }

        response.put("success", true);
        response.put("events", events);
        response.put("shooter", deputy.name);
        response.put("target", targetName);
        response.put("targetRole", targetRole);

        return response;
    }

    /**
     * Doom Sayer guesses 3 players' roles during the day
     */
    @PostMapping("/game/{gameId}/doomsayer-guess")
    public Map<String, Object> doomsayerGuess(
            @PathVariable String gameId,
            @RequestBody Map<String, Object> request) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        if (gameState.currentPhase != GamePhase.DAY) {
            throw new RuntimeException("Doom Sayer can only guess during day phase");
        }

        String doomsayerName = (String) request.get("doomsayerName");
        if (doomsayerName == null || doomsayerName.isEmpty()) {
            throw new RuntimeException("Doom Sayer name is required");
        }

        // Find the Doom Sayer
        Player doomsayer = gameState.getPlayerByName(doomsayerName);
        if (doomsayer == null) {
            throw new RuntimeException("Doom Sayer not found: " + doomsayerName);
        }
        if (doomsayer.getrole() != Roles.Doom_sayer) {
            throw new RuntimeException(doomsayerName + " is not a Doom Sayer");
        }
        if (!doomsayer.isAlive()) {
            throw new RuntimeException("Doom Sayer must be alive to guess");
        }

        // Check if they've already used their one-time guess
        if (doomsayer.isDeputyShotUsed()) { // Reusing this flag for one-time tracking
            throw new RuntimeException("Doom Sayer has already used their one-time guess");
        }

        // Get the guesses - expecting List<Map<String, String>> with player names and guessed roles
        @SuppressWarnings("unchecked")
        List<Map<String, String>> guesses = (List<Map<String, String>>) request.get("guesses");

        if (guesses == null || guesses.size() != 3) {
            throw new RuntimeException("Doom Sayer must guess exactly 3 players");
        }

        Map<String, Object> response = new HashMap<>();
        List<String> events = new ArrayList<>();
        boolean allCorrect = true;
        List<Map<String, Object>> guessResults = new ArrayList<>();

        // Process each guess
        for (Map<String, String> guess : guesses) {
            String playerName = guess.get("playerName");
            String guessedRole = guess.get("guessedRole");

            if (playerName == null || guessedRole == null) {
                throw new RuntimeException("Each guess must have playerName and guessedRole");
            }

            Player target = gameState.getPlayerByName(playerName);
            if (target == null) {
                throw new RuntimeException("Player not found: " + playerName);
            }
            if (!target.isAlive()) {
                throw new RuntimeException("Cannot guess role of dead player: " + playerName);
            }

            // Check if guess is correct
            String actualRole = target.getrole().toString();
            boolean correct = actualRole.equals(guessedRole);

            if (!correct) {
                allCorrect = false;
            }

            Map<String, Object> guessResult = new HashMap<>();
            guessResult.put("playerName", playerName);
            guessResult.put("guessedRole", guessedRole);
            guessResult.put("actualRole", actualRole);
            guessResult.put("correct", correct);
            guessResults.add(guessResult);

            events.add(doomsayerName + " guessed " + playerName + " is " + guessedRole + " - " + (correct ? "CORRECT" : "WRONG (actually " + actualRole + ")"));
        }

        // Mark guess as used
        doomsayer.setDeputyShotUsed(true); // Reusing this flag

        // If all guesses are correct, Doom Sayer wins
        if (allCorrect) {
            events.add("🎉 DOOM SAYER WINS! All 3 guesses were correct! " + doomsayerName + " wins the game!");
            response.put("doomsayerWon", true);
        } else {
            events.add("❌ Doom Sayer's guess failed. They have been revealed to everyone.");
            response.put("doomsayerWon", false);
        }

        response.put("success", true);
        response.put("events", events);
        response.put("doomsayerName", doomsayerName);
        response.put("allCorrect", allCorrect);
        response.put("guessResults", guessResults);

        return response;
    }

    /**
     * Tanner revenge kill (triggered after being lynched)
     */
    @PostMapping("/game/{gameId}/tanner-revenge")
    public Map<String, Object> tannerRevenge(
            @PathVariable String gameId,
            @RequestBody Map<String, String> request) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        String tannerName = request.get("tannerName");
        String targetName = request.get("targetName");

        if (tannerName == null || tannerName.isEmpty()) {
            throw new RuntimeException("Tanner name is required");
        }
        if (targetName == null || targetName.isEmpty()) {
            throw new RuntimeException("Target name is required");
        }

        // Verify tanner exists and is dead
        Player tanner = gameState.getPlayerByName(tannerName);
        if (tanner == null) {
            throw new RuntimeException("Tanner not found: " + tannerName);
        }
        if (tanner.getrole() != Roles.Tanner) {
            throw new RuntimeException(tannerName + " is not a Tanner");
        }
        if (tanner.isAlive()) {
            throw new RuntimeException("Tanner must be dead to use revenge kill");
        }

        // Find the target
        Player target = gameState.getPlayerByName(targetName);
        if (target == null) {
            throw new RuntimeException("Target not found: " + targetName);
        }
        if (!target.isAlive()) {
            throw new RuntimeException("Cannot kill a dead player");
        }

        Map<String, Object> response = new HashMap<>();
        List<String> events = new ArrayList<>();

        // Kill the target
        target.kill();
        String targetRole = gameState.mistWolfAlive ? "Hidden" : target.getrole().toString();
        events.add(tannerName + " (Tanner) revenge killed " + targetName + ". Role: " + targetRole);

        // Check if target was a Hunter (chain revenge)
        if (target.getrole() == Roles.Hunter) {
            events.add("⚠️ " + targetName + " was a Hunter! They get a revenge kill.");
            response.put("hunterRevenge", true);
            response.put("hunterName", targetName);
        }

        // Check Cupid links
        if (target.getCupidLinkedTo() != null) {
            Player linked = gameState.getPlayerByName(target.getCupidLinkedTo());
            if (linked != null && linked.isAlive()) {
                linked.kill();
                String linkedRole = gameState.mistWolfAlive ? "Hidden" : linked.getrole().toString();
                events.add("💔 " + linked.name + " died due to Cupid link. Role: " + linkedRole);

                if (linked.getrole() == Roles.Hunter) {
                    events.add("⚠️ " + linked.name + " was also a Hunter! They get a revenge kill.");
                    response.put("linkedHunterRevenge", true);
                    response.put("linkedHunterName", linked.name);
                }
            }
        }

        response.put("success", true);
        response.put("events", events);
        response.put("tanner", tannerName);
        response.put("target", targetName);
        response.put("targetRole", targetRole);

        return response;
    }

    /**
     * Hunter revenge kill (can be triggered after lynch or night death)
     */
    @PostMapping("/game/{gameId}/hunter-revenge")
    public Map<String, Object> hunterRevenge(
            @PathVariable String gameId,
            @RequestBody Map<String, String> request) {
        GameState gameState = games.get(gameId);
        if (gameState == null) {
            throw new RuntimeException("Game not found");
        }

        String hunterName = request.get("hunterName");
        String targetName = request.get("targetName");

        if (hunterName == null || hunterName.isEmpty()) {
            throw new RuntimeException("Hunter name is required");
        }
        if (targetName == null || targetName.isEmpty()) {
            throw new RuntimeException("Target name is required");
        }

        // Verify hunter exists and is dead
        Player hunter = gameState.getPlayerByName(hunterName);
        if (hunter == null) {
            throw new RuntimeException("Hunter not found: " + hunterName);
        }
        if (hunter.getrole() != Roles.Hunter) {
            throw new RuntimeException(hunterName + " is not a Hunter");
        }
        if (hunter.isAlive()) {
            throw new RuntimeException("Hunter must be dead to use revenge kill");
        }

        // Find the target
        Player target = gameState.getPlayerByName(targetName);
        if (target == null) {
            throw new RuntimeException("Target not found: " + targetName);
        }
        if (!target.isAlive()) {
            throw new RuntimeException("Cannot shoot a dead player");
        }

        Map<String, Object> response = new HashMap<>();
        List<String> events = new ArrayList<>();

        // Kill the target
        target.kill();
        String targetRole = gameState.mistWolfAlive ? "Hidden" : target.getrole().toString();
        events.add(hunterName + " (Hunter) revenge killed " + targetName + ". Role: " + targetRole);

        // Check if target was also a Hunter (chain revenge)
        if (target.getrole() == Roles.Hunter) {
            events.add("⚠️ " + targetName + " was also a Hunter! They get a revenge kill.");
            response.put("chainHunterRevenge", true);
            response.put("chainHunterName", targetName);
        }

        // Check Cupid links
        if (target.getCupidLinkedTo() != null) {
            Player linked = gameState.getPlayerByName(target.getCupidLinkedTo());
            if (linked != null && linked.isAlive()) {
                linked.kill();
                String linkedRole = gameState.mistWolfAlive ? "Hidden" : linked.getrole().toString();
                events.add("💔 " + linked.name + " died due to Cupid link. Role: " + linkedRole);

                if (linked.getrole() == Roles.Hunter) {
                    events.add("⚠️ " + linked.name + " was also a Hunter! They get a revenge kill.");
                    response.put("linkedHunterRevenge", true);
                    response.put("linkedHunterName", linked.name);
                }
            }
        }

        response.put("success", true);
        response.put("events", events);
        response.put("hunter", hunterName);
        response.put("target", targetName);
        response.put("targetRole", targetRole);

        return response;
    }

    // Helper method to check if a player is town-aligned
    private boolean isTownAligned(Player player) {
        Roles role = player.getrole();
        // Town roles (not werewolves, not neutrals)
        return role == Roles.Villager ||
               // Town Investigative
               role == Roles.Seer || role == Roles.Apprentice_Seer || role == Roles.Aura_Seer ||
               role == Roles.Ghost || role == Roles.Private_Investigator || role == Roles.Clockmaker ||
               role == Roles.Tracker || role == Roles.Lookout || role == Roles.Empath ||
               // Town Protective
               role == Roles.Bodyguard || role == Roles.Witch || role == Roles.Escort || role == Roles.Trickster ||
               // Town Killing
               role == Roles.Deputy || role == Roles.Vigilante || role == Roles.Veteran || role == Roles.Hunter ||
               // Town Negative (still town-aligned)
               role == Roles.Cupid || role == Roles.Lycan || role == Roles.Cursed;
    }

    // Helper method to update Mistwolf alive status
    private void updateMistwolfStatus(GameState gameState) {
        boolean mistwolfAlive = false;
        for (Player player : gameState.players) {
            if (player.getrole() == Roles.Mistwolf && player.isAlive()) {
                mistwolfAlive = true;
                break;
            }
        }
        gameState.mistWolfAlive = mistwolfAlive;
    }

    // Helper method to find role by name (case-insensitive)
    private Roles findRoleByName(String roleName) {
        // Try exact match first
        try {
            return Roles.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            // Try case-insensitive match
            for (Roles role : Roles.values()) {
                if (role.toString().equalsIgnoreCase(roleName)) {
                    return role;
                }
            }
        }
        // If not found, throw exception
        throw new IllegalArgumentException("No role found matching: " + roleName);
    }

    // Validate that there are no duplicate roles (except Villager)
    private void validateNoDuplicateRoles(List<Roles> roles) {
        Map<Roles, Integer> roleCounts = new HashMap<>();

        // Count occurrences of each role
        for (Roles role : roles) {
            roleCounts.put(role, roleCounts.getOrDefault(role, 0) + 1);
        }

        // Check for duplicates (Villager is allowed to have duplicates)
        for (Map.Entry<Roles, Integer> entry : roleCounts.entrySet()) {
            Roles role = entry.getKey();
            int count = entry.getValue();

            if (count > 1 && role != Roles.Villager) {
                throw new RuntimeException("Duplicate role detected: " + role + " appears " + count + " times. Only Villager can have duplicates.");
            }
        }
    }

    // Helper method to get a random role from a category
    private Roles getRandomRoleFromCategory(String categoryName, Set<Roles> excludedRoles) {
        Roles[] roles;

        // Map category name to the appropriate role array
        switch (categoryName) {
            case "TOWN_INVESTIGATIVE":
                roles = RoleList.TOWN_INVESTIGATIVE_ROLES;
                break;
            case "TOWN_PROTECTIVE":
                roles = RoleList.TOWN_PROTECTIVE_ROLES;
                break;
            case "TOWN_KILLING":
                roles = RoleList.TOWN_KILLING_ROLES;
                break;
            case "TOWN_NEGATIVE":
                roles = RoleList.TOWN_NEGATIVE_ROLES;
                break;
            case "TOWN":
                roles = RoleList.TOWN_ROLES;
                break;
            case "WEREWOLF":
                roles = RoleList.WEREWOLF_ROLES;
                break;
            case "NEUTRAL_BENIGN":
                roles = RoleList.NEUTRAL_BENIGN_ROLES;
                break;
            case "NEUTRAL_APOCALYPSE":
                roles = RoleList.NEUTRAL_APOCALYPSE_ROLES;
                break;
            default:
                throw new IllegalArgumentException("Unknown category: " + categoryName);
        }

        if (roles.length == 0) {
            throw new IllegalArgumentException("Category " + categoryName + " has no roles");
        }

        // Filter out already-used roles (Villager can be reused)
        List<Roles> availableRoles = new ArrayList<>();
        for (Roles role : roles) {
            if (role == Roles.Villager || !excludedRoles.contains(role)) {
                availableRoles.add(role);
            }
        }

        // If no roles available (all used), fall back to Villager
        if (availableRoles.isEmpty()) {
            return Roles.Villager;
        }

        // Return a random role from available roles
        return availableRoles.get(random.nextInt(availableRoles.size()));
    }

    // Generate random roles for a game based on player count
    private ArrayList<Roles> generateRandomRoles(int playerCount) {
        ArrayList<Roles> gameRoles = new ArrayList<>();

        // Simple default role distribution (similar to old Game.java)
        int werewolfCount = Math.min((int) Math.ceil(playerCount / 5.0), RoleList.WEREWOLF_ROLES.length);
        int neutralCount = Math.min((int) Math.ceil(playerCount / 8.0), RoleList.NEUTRAL_BENIGN_ROLES.length);
        int villagerCount = (int) Math.ceil(playerCount / 6.0);
        int townCount = playerCount - werewolfCount - neutralCount - villagerCount;

        // Generate roles
        gameRoles.addAll(pickRandomUniqueRoles(Arrays.asList(RoleList.WEREWOLF_ROLES), werewolfCount));
        gameRoles.addAll(pickRandomUniqueRoles(Arrays.asList(RoleList.NEUTRAL_BENIGN_ROLES), neutralCount));
        gameRoles.addAll(pickRandomUniqueRoles(Arrays.asList(RoleList.TOWN_ROLES), townCount));

        // Fill remaining with villagers
        int remainingVillagers = playerCount - gameRoles.size();
        for (int i = 0; i < remainingVillagers; i++) {
            gameRoles.add(Roles.Villager);
        }

        return gameRoles;
    }

    // Pick random unique roles from a pool
    private ArrayList<Roles> pickRandomUniqueRoles(List<Roles> pool, int amount) {
        ArrayList<Roles> available = new ArrayList<>(pool);
        ArrayList<Roles> selected = new ArrayList<>();

        for (int i = 0; i < amount && !available.isEmpty(); i++) {
            int index = random.nextInt(available.size());
            selected.add(available.remove(index));
        }

        return selected;
    }

    // Helper class to store game state
    private static class GameState {
        ArrayList<Player> players;
        ArrayList<Roles> roles;
        GamePhase currentPhase;
        int dayNumber;
        int nightNumber;
        List<NightAction> pendingActions;
        List<String> actionHistory;
        boolean mistWolfAlive;
        String cubwolfDiedLastNight;
        List<RoleListItem> originalRoleList; // Store original role list for intelligent skipping

        GameState(ArrayList<Player> players, ArrayList<Roles> roles) {
            this(players, roles, null);
        }

        GameState(ArrayList<Player> players, ArrayList<Roles> roles, List<RoleListItem> originalRoleList) {
            this.players = players;
            this.roles = roles;
            this.originalRoleList = originalRoleList;
            this.currentPhase = GamePhase.NIGHT_ONE;
            this.dayNumber = 0;
            this.nightNumber = 1;
            this.pendingActions = new ArrayList<>();
            this.actionHistory = new ArrayList<>();
            this.mistWolfAlive = roles.contains(Roles.Mistwolf);
            this.cubwolfDiedLastNight = null;
        }

        public void advanceToDay() {
            this.currentPhase = GamePhase.DAY;
            this.dayNumber++;
        }

        public void advanceToNight() {
            if (currentPhase == GamePhase.DAY) {
                this.currentPhase = GamePhase.NIGHT;
                this.nightNumber++;
                // Reset nightly effects for all players
                for (Player player : players) {
                    player.resetNightlyEffects();
                }
                // Clear pending actions from previous night
                this.pendingActions.clear();
            }
        }

        public void addAction(NightAction action) {
            this.pendingActions.add(action);
            this.actionHistory.add(action.toString());
        }

        public boolean removeAction(String actionId) {
            return this.pendingActions.removeIf(action -> action.getActionId().equals(actionId));
        }

        public Player getPlayerByName(String name) {
            return players.stream()
                    .filter(p -> p.name.equals(name))
                    .findFirst()
                    .orElse(null);
        }

        public void updateMistWolfStatus() {
            mistWolfAlive = players.stream()
                    .anyMatch(p -> p.isAlive() && p.getrole() == Roles.Mistwolf);
        }
    }
}