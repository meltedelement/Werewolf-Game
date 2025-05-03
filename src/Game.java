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

    private boolean useApocalypse;
    private int townRatio;
    private int neutralRatio;
    private int werewolfRatio;
    private int townProtectiveRatio;
    private int townKillingRatio;
    private int townNegativeRatio;
    private int townInvestigativeRatio;

    public Game(boolean useApocalypse){
        this.useApocalypse = useApocalypse;
        this.PLAYERS = new ArrayList<>();
        this.gameRoles = new ArrayList<>();

        //if we are using apocalypse neutrals, add it to our possible role list.
        if(useApocalypse){
            this.NEUTRAL_ROLES = new Roles[][]{RoleList.NEUTRAL_APOCALYPSE_ROLES, RoleList.NEUTRAL_BENIGN_ROLES};
        }else{
            this.NEUTRAL_ROLES = new Roles[][]{RoleList.NEUTRAL_BENIGN_ROLES};
        }
    }

    private void standardRoleRatio(int playerAmount){
        //1 werewolf for every 5 people
        //1 neutral for every 8 people
        //1 villager for every 6 people
        werewolfRatio = (int) Math.min(Math.ceil((double) playerAmount / 5), RoleList.WEREWOLF_ROLES.length);
        neutralRatio = (int) Math.min(Math.ceil((double) playerAmount / 8), NEUTRAL_ROLES.length);
        int villagerAmount = (int) Math.ceil((double) playerAmount / 6);
        townRatio = playerAmount - werewolfRatio - neutralRatio - villagerAmount;
    }

    private void standardTownRatios(int townAmount){
        townProtectiveRatio = (int) Math.min(Math.ceil((double) townAmount / 4), RoleList.TOWN_PROTECTIVE_ROLES.length);
        townInvestigativeRatio = (int) Math.min(Math.ceil((double) townAmount / 4), RoleList.TOWN_INVESTIGATIVE_ROLES.length);
        townKillingRatio = (int) Math.min(Math.ceil((double) townAmount / 5), RoleList.TOWN_KILLING_ROLES.length);
        townNegativeRatio = (int) Math.min(Math.ceil((double) townAmount / 5), RoleList.TOWN_NEGATIVE_ROLES.length);
    }

    public void makeRandomRoles(){
        gameRoles.clear();

        if(werewolfRatio == 0 && townRatio == 0 && neutralRatio == 0){
            standardRoleRatio(PLAYERS.size());
        }
        gameRoles.addAll(generateRandomWerewolf(werewolfRatio));
        gameRoles.addAll(generateRandomNeutral(neutralRatio));
        gameRoles.addAll(generateRandomTown(townRatio));

        int villageNumber = PLAYERS.size() - gameRoles.size();

        for(int i=0; i<villageNumber; i++){
            gameRoles.add(Roles.Villager);
        }
    }

    public void addPlayer(String name){
        PLAYERS.add(new Player(name));
    }

    public void setUseApocalypse(boolean useApocalypse) {
        this.useApocalypse = useApocalypse;
    }

    private ArrayList<Roles> generateRandomTown(int amount){
        ArrayList<Roles> availableRoles = new ArrayList<>();
        for (Roles[] group : TOWN_ROLES) {
            availableRoles.addAll(Arrays.asList(group));
        }
        ArrayList<Roles> selectedRoles = new ArrayList<>();

        for(int i=0; i<amount && !availableRoles.isEmpty(); i++){
            int randomIndex = (int) (Math.random() * availableRoles.size());
            selectedRoles.add(availableRoles.remove(randomIndex));
        }

        return selectedRoles;
    }

    private ArrayList<Roles> generateRandomNeutral(int amount){
        ArrayList<Roles> availableRoles = new ArrayList<>();
        for (Roles[] group : NEUTRAL_ROLES) {
            availableRoles.addAll(Arrays.asList(group));
        }

        ArrayList<Roles> selectedRoles = new ArrayList<>();
        for (int i = 0; i < amount && !availableRoles.isEmpty(); i++) {
            int randomIndex = (int) (Math.random() * availableRoles.size());
            selectedRoles.add(availableRoles.remove(randomIndex));
        }

        return selectedRoles;
    }


    private ArrayList<Roles> generateRandomWerewolf(int amount){

        ArrayList<Roles> availableRoles = new ArrayList<>(Arrays.asList(RoleList.WEREWOLF_ROLES));
        ArrayList<Roles> selectedRoles = new ArrayList<>();

        for (int i = 0; i < amount && !availableRoles.isEmpty(); i++) {
            int randomIndex = (int) (Math.random() * availableRoles.size());
            selectedRoles.add(availableRoles.remove(randomIndex));
        }

        return selectedRoles;
    }

    public ArrayList<Roles> getTownRoles(int amount){
        return generateRandomTown(amount);
    }

    public ArrayList<Roles> getNeutralRoles(int amount){
        return generateRandomNeutral(amount);
    }

    public ArrayList<Roles> getWerewolfRoles(int amount){
        return generateRandomWerewolf(amount);
    }

    public ArrayList<Player> getPlayers() {
        return PLAYERS;
    }

    public ArrayList<Roles> getGameRoles() {
        return gameRoles;
    }

    public void setWerewolfRatio(int werewolfRatio) {
        this.werewolfRatio = Math.min(werewolfRatio, RoleList.WEREWOLF_ROLES.length);
    }

    public void setTownRatio(int townRatio) {
        this.townRatio = townRatio;
    }

    public void setNeutralRatio(int neutralRatio) {
        int neutralLength =0;
        for (Roles[] neutralRole : NEUTRAL_ROLES) {
            neutralLength += neutralRole.length;
        }
        this.neutralRatio = Math.min(neutralRatio, neutralLength);
    }
}
