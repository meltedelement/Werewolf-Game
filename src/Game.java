import java.util.ArrayList;
import java.util.Arrays;

public class Game {
    public static final Roles[][] TOWN_ROLES = {RoleList.TOWN_INVESTIGATIVE_ROLES, RoleList.TOWN_NEGATIVE_ROLES,
            RoleList.TOWN_KILLING_ROLES, RoleList.TOWN_PROTECTIVE_ROLES};

    private final ArrayList<Player> players;
    ArrayList<Roles> gameRoles;
    private boolean useApocalypse;
    private int villagerAmount;
    private int townRatio;
    private int neutralRatio;
    private int werewolfRatio;

    public Roles[][] neutralRoles;

    public Game(boolean useApocalypse){
        this.useApocalypse = useApocalypse;
        this.gameRoles = new ArrayList<>();

        if(useApocalypse){
            this.neutralRoles = new Roles[][]{RoleList.NEUTRAL_APOCALYPSE_ROLES, RoleList.NEUTRAL_BENIGN_ROLES};
        }else{
            this.neutralRoles = new Roles[][]{RoleList.NEUTRAL_BENIGN_ROLES};
        }
        this.players = new ArrayList<>();
    }

    private void standardRoleRatio(int playerAmount){
        //1 werewolf for every 5 people
        //1 neutral for every 8 people
        werewolfRatio = (int) Math.ceil((double) playerAmount / 5);
        neutralRatio = (int) Math.ceil((double) playerAmount / 8);
        villagerAmount = (int) Math.ceil((double) playerAmount / 6);
        townRatio = playerAmount - werewolfRatio - neutralRatio - villagerAmount;
    }

    public void makeRandomRoles(){
        standardRoleRatio(players.size());

        gameRoles.addAll(generateRandomWerewolf(werewolfRatio));
        gameRoles.addAll(generateRandomNeutral(neutralRatio));
        gameRoles.addAll(generateRandomTown(townRatio));
        for(int i=0; i<villagerAmount; i++){
            gameRoles.add(Roles.Villager);
        }
    }

    public void addPlayer(String name){
        players.add(new Player(name));
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
        for (Roles[] group : neutralRoles) {
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

    public boolean isUseApocalypse() {
        return useApocalypse;
    }

    public ArrayList<Player> getPlayers() {
        return players;
    }

    public ArrayList<Roles> getGameRoles() {
        return gameRoles;
    }
}
