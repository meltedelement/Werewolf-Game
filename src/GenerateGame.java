import java.util.ArrayList;

public class GenerateGame {

    //have a list of possible roles
    //classes for town, neutral, and werewolf
    private ArrayList<String> players;
    private int werewolfAmount;
    private int townAmount;
    private int neutralAmount;

    TownRole roles = new TownRole("town");

    public GenerateGame(){
    }

    //be able to set the amounts of each and generate a random list based on those amounts

    public void setWerewolfAmount(int werewolfAmount) {
        this.werewolfAmount = werewolfAmount;
    }

    public void setNeutralAmount(int neutralAmount) {
        this.neutralAmount = neutralAmount;
    }

    public void setTownAmount(int townAmount) {
        this.townAmount = townAmount;
    }

    public ArrayList<String> generateRandomTown(int amount){
        ArrayList<String> possibleRoles = roles.getTownInvestigativeList();
        possibleRoles.addAll(roles.getTownProtectiveList());
        possibleRoles.addAll(roles.getTownNegativeList());
        possibleRoles.addAll(roles.getTownKillingList());

        ArrayList<String> townRoles = new ArrayList<>();

        for(int i=0; i<amount; i++){
            int randomNumber = (int) (Math.random() * possibleRoles.size());
        }

        return townRoles;
    }
}
