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

    public ArrayList<String> generateRandomTown(){
        ArrayList<String> ti = roles.getTownInvestigativeList();
        ArrayList<String> tp = roles.getTownProtectiveList();
        ArrayList<String> tn = roles.getTownNegativeList();
        ArrayList<String> tk = roles.getTownKillingList();


    }
}
