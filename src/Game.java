import javax.management.relation.Role;
import java.util.ArrayList;
import java.util.Arrays;

public class Game {

    //have a list of possible roles
    //classes for town, neutral, and werewolf
    private ArrayList<String> players;
    private int werewolfAmount;
    private int townAmount;
    private int neutralAmount;
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

    public void setWerewolfAmount(int werewolfAmount) {
        this.werewolfAmount = werewolfAmount;
    }

    public void setNeutralAmount(int neutralAmount) {
        this.neutralAmount = neutralAmount;
    }

    public void setTownAmount(int townAmount) {
        this.townAmount = townAmount;
    }

    private ArrayList<Roles> generateRandomTown(int amount){
        ArrayList<Roles> theseTownRoles = new ArrayList<>();

        for(int i=0; i<amount; i++){
            int randomTownList = (int) (Math.random() * TOWN_ROLES.length);
            int randomTown = (int) (Math.random() * TOWN_ROLES[randomTownList].length);
            theseTownRoles.add(TOWN_ROLES[randomTownList][randomTown]);
        }

        return theseTownRoles;
    }

    private ArrayList<Roles> generateRandomNeutral(int amount){
        ArrayList<Roles> theseNeutralRoles = new ArrayList<>();

        for (int i = 0; i < amount; i++) {
            int randomNeutralList = (int) (Math.random() * neutralRoles.length);
            int randomNeutral = (int) (Math.random() * neutralRoles[randomNeutralList].length);
            theseNeutralRoles.add(neutralRoles[randomNeutralList][randomNeutral]);
        }

        return theseNeutralRoles;
    }


    private ArrayList<Roles> generateRandomWerewolf(int amount){

        ArrayList<Roles> theseWerewolfRoles = new ArrayList<>();

        for(int i=0; i<amount; i++){
            int randomWerewolf = (int) (Math.random() * RoleList.WEREWOLF_ROLES.length);
            theseWerewolfRoles.add(RoleList.WEREWOLF_ROLES[randomWerewolf]);
        }

        return theseWerewolfRoles;
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
