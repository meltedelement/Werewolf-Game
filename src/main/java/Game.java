import java.util.ArrayList;
import java.util.Arrays;

public class Game {

    private static final Roles[][] TOWN_ROLES = {
            RoleList.TOWN_INVESTIGATIVE_ROLES,
            RoleList.TOWN_NEGATIVE_ROLES,
            RoleList.TOWN_KILLING_ROLES,
            RoleList.TOWN_PROTECTIVE_ROLES
    };

    private final Roles[][] NEUTRAL_ROLES;
    private final ArrayList<Player> PLAYERS;
    private final ArrayList<Roles> gameRoles;

    public Game(boolean useApocalypse) {
        this.PLAYERS = new ArrayList<>();
        this.gameRoles = new ArrayList<>();

        this.NEUTRAL_ROLES = useApocalypse
                ? new Roles[][]{RoleList.NEUTRAL_APOCALYPSE_ROLES, RoleList.NEUTRAL_BENIGN_ROLES}
                : new Roles[][]{RoleList.NEUTRAL_BENIGN_ROLES};
    }

    public void makeRandomRoles() {
        gameRoles.clear();

        int playerCount = PLAYERS.size();

        // Simple default role distribution
        int werewolfCount = Math.min((int) Math.ceil(playerCount / 5.0), RoleList.WEREWOLF_ROLES.length);
        int neutralCount = Math.min((int) Math.ceil(playerCount / 8.0), totalNeutralRoles());
        int villagerCount = (int) Math.ceil(playerCount / 6.0);
        int townCount = playerCount - werewolfCount - neutralCount - villagerCount;

        // Generate roles
        gameRoles.addAll(generateRandomWerewolf(werewolfCount));
        gameRoles.addAll(generateRandomNeutral(neutralCount));
        gameRoles.addAll(generateRandomTown(townCount));

        // Fill remaining with villagers
        int remainingVillagers = PLAYERS.size() - gameRoles.size();
        for (int i = 0; i < remainingVillagers; i++) {
            gameRoles.add(Roles.Villager);
        }
    }

    public void addPlayer(String name) {
        PLAYERS.add(new Player(name));
    }

    private ArrayList<Roles> generateRandomTown(int amount) {
        ArrayList<Roles> available = new ArrayList<>();
        for (Roles[] group : TOWN_ROLES) {
            available.addAll(Arrays.asList(group));
        }

        return pickRandomUniqueRoles(available, amount);
    }

    private ArrayList<Roles> generateRandomNeutral(int amount) {
        ArrayList<Roles> available = new ArrayList<>();
        for (Roles[] group : NEUTRAL_ROLES) {
            available.addAll(Arrays.asList(group));
        }

        return pickRandomUniqueRoles(available, amount);
    }

    private ArrayList<Roles> generateRandomWerewolf(int amount) {
        return pickRandomUniqueRoles(new ArrayList<>(Arrays.asList(RoleList.WEREWOLF_ROLES)), amount);
    }

    private ArrayList<Roles> pickRandomUniqueRoles(ArrayList<Roles> pool, int amount) {
        ArrayList<Roles> selected = new ArrayList<>();
        for (int i = 0; i < amount && !pool.isEmpty(); i++) {
            int index = (int) (Math.random() * pool.size());
            selected.add(pool.remove(index));
        }
        return selected;
    }

    private int totalNeutralRoles() {
        int total = 0;
        for (Roles[] group : NEUTRAL_ROLES) {
            total += group.length;
        }
        return total;
    }

    // Getters
    public ArrayList<Player> getPlayers() {
        return PLAYERS;
    }

    public ArrayList<Roles> getGameRoles() {
        return gameRoles;
    }

}
