import javax.management.relation.Role;
import java.util.ArrayList;
import java.util.Arrays;

public class Game {

    //have a list of possible roles
    //classes for town, neutral, and werewolf
    private ArrayList<String> players;
    private final boolean useApocalypse;

    public static final Roles[][] TOWN_ROLES = {RoleList.TOWN_INVESTIGATIVE_ROLES, RoleList.TOWN_NEGATIVE_ROLES,
    RoleList.TOWN_KILLING_ROLES, RoleList.TOWN_PROTECTIVE_ROLES};

    public Roles[][] neutralRoles;

    public Game(boolean useApocalypse){
        this.useApocalypse = useApocalypse;
        if(useApocalypse){
            this.neutralRoles = new Roles[][]{RoleList.NEUTRAL_APOCALYPSE_ROLES, RoleList.NEUTRAL_BENIGN_ROLES};
        }else{
            this.neutralRoles = new Roles[][]{RoleList.NEUTRAL_BENIGN_ROLES};
        }
        this.players = new ArrayList<>();
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
}
