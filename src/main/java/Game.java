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

    private boolean useStandardTownRatios;
    private int townRatio;
    private int neutralRatio;
    private int werewolfRatio;
    private int townProtectiveRatio;
    private int townKillingRatio;
    private int townNegativeRatio;
    private int townInvestigativeRatio;

    public Game(boolean useApocalypse) {
        this.useStandardTownRatios = true;
        this.PLAYERS = new ArrayList<>();
        this.gameRoles = new ArrayList<>();

        this.NEUTRAL_ROLES = useApocalypse
                ? new Roles[][]{RoleList.NEUTRAL_APOCALYPSE_ROLES, RoleList.NEUTRAL_BENIGN_ROLES}
                : new Roles[][]{RoleList.NEUTRAL_BENIGN_ROLES};
    }

    private void standardRoleRatio(int playerCount) {
        werewolfRatio = Math.min((int) Math.ceil(playerCount / 5.0), RoleList.WEREWOLF_ROLES.length);
        neutralRatio = Math.min((int) Math.ceil(playerCount / 8.0), totalNeutralRoles());
        int villagerCount = (int) Math.ceil(playerCount / 6.0);
        townRatio = playerCount - werewolfRatio - neutralRatio - villagerCount;
    }

    private void standardTownRatios(int townAmount) {
        townProtectiveRatio = Math.min((int) Math.ceil(townAmount / 4.0), RoleList.TOWN_PROTECTIVE_ROLES.length);
        townInvestigativeRatio = Math.min((int) Math.ceil(townAmount / 4.0), RoleList.TOWN_INVESTIGATIVE_ROLES.length);
        townKillingRatio = Math.min((int) Math.ceil(townAmount / 5.0), RoleList.TOWN_KILLING_ROLES.length);
        townNegativeRatio = Math.min((int) Math.ceil(townAmount / 5.0), RoleList.TOWN_NEGATIVE_ROLES.length);
    }

    public void makeRandomRoles() {
        gameRoles.clear();

        if (werewolfRatio == 0 && townRatio == 0 && neutralRatio == 0) {
            standardRoleRatio(PLAYERS.size());
        }

        if(useStandardTownRatios){
            standardTownRatios(townRatio);
        }

        gameRoles.addAll(generateRandomWerewolf(werewolfRatio));
        gameRoles.addAll(generateRandomNeutral(neutralRatio));
        gameRoles.addAll(generateRandomTown());

        int villagerCount = PLAYERS.size() - gameRoles.size();
        for (int i = 0; i < villagerCount; i++) {
            gameRoles.add(Roles.Villager);
        }
    }

    public void addPlayer(String name) {
        PLAYERS.add(new Player(name));
    }

    private ArrayList<Roles> generateRandomTown() {
        ArrayList<Roles> selectedRoles = new ArrayList<>();

        selectedRoles.addAll(pickRandomUniqueRoles(new ArrayList<>(Arrays.asList(RoleList.TOWN_PROTECTIVE_ROLES)), townProtectiveRatio));
        selectedRoles.addAll(pickRandomUniqueRoles(new ArrayList<>(Arrays.asList(RoleList.TOWN_INVESTIGATIVE_ROLES)), townInvestigativeRatio));
        selectedRoles.addAll(pickRandomUniqueRoles(new ArrayList<>(Arrays.asList(RoleList.TOWN_KILLING_ROLES)), townKillingRatio));
        selectedRoles.addAll(pickRandomUniqueRoles(new ArrayList<>(Arrays.asList(RoleList.TOWN_NEGATIVE_ROLES)), townNegativeRatio));

        return selectedRoles;
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

    // Setters (with role pool size protection)
    public void setWerewolfRatio(int werewolfRatio) {
        this.werewolfRatio = Math.min(werewolfRatio, RoleList.WEREWOLF_ROLES.length);
    }

    public void setTownRatio(int townRatio) {
        this.townRatio = townRatio;
    }

    public void setNeutralRatio(int neutralRatio) {
        this.neutralRatio = Math.min(neutralRatio, totalNeutralRoles());
    }

    public void setTownProtectiveRatio(int townProtectiveRatio) {
        this.townProtectiveRatio = Math.min(townProtectiveRatio, Math.min(RoleList.TOWN_PROTECTIVE_ROLES.length, townRatio));
        this.useStandardTownRatios = false;
    }

    public void setTownInvestigativeRatio(int townInvestigativeRatio) {
        this.townInvestigativeRatio = Math.min(townInvestigativeRatio, Math.min(RoleList.TOWN_INVESTIGATIVE_ROLES.length, townRatio));
        this.useStandardTownRatios = false;
    }

    public void setTownKillingRatio(int townKillingRatio) {
        this.townKillingRatio = Math.min(townKillingRatio, Math.min(RoleList.TOWN_KILLING_ROLES.length, townRatio));
        this.useStandardTownRatios = false;
    }

    public void setTownNegativeRatio(int townNegativeRatio) {
        this.townNegativeRatio = Math.min(townNegativeRatio, Math.min(RoleList.TOWN_NEGATIVE_ROLES.length, townRatio));
        this.useStandardTownRatios = false;
    }

}
