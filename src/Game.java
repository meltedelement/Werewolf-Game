import java.util.ArrayList;

public class Game {

    //have a list of possible roles
    //classes for town, neutral, and werewolf
    private ArrayList<String> players;
    private int werewolfAmount;
    private int townAmount;
    private int neutralAmount;
    private boolean useApocalypse;

    TownRole townRoles = new TownRole("town");
    WerewolfRole werewolfRoles = new WerewolfRole("evil");
    NeutralRole neutralRoles = new NeutralRole("neutral");

    public Game(boolean useApocalypse){
        this.useApocalypse = useApocalypse;
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

    private ArrayList<String> generateRandomTown(int amount){
        ArrayList<String> possibleRoles = townRoles.getTownInvestigativeList();
        possibleRoles.addAll(townRoles.getTownProtectiveList());
        possibleRoles.addAll(townRoles.getTownNegativeList());
        possibleRoles.addAll(townRoles.getTownKillingList());

        ArrayList<String> theseTownRoles = new ArrayList<>();

        for(int i=0; i<amount; i++){
            int randomNumber = (int) (Math.random() * possibleRoles.size());
            theseTownRoles.add(possibleRoles.get(randomNumber));
        }

        return theseTownRoles;
    }

    private ArrayList<String> generateRandomNeutral(int amount){
        ArrayList<String> possibleRoles = neutralRoles.getNeutralBenign();
        if(useApocalypse){
            possibleRoles.addAll(neutralRoles.getNeutralApocalypse());
        }
        ArrayList<String> theseNeutralRoles = new ArrayList<>();

        for (int i=0; i<amount; i++){
            int randomNumber = (int) (Math.random() * possibleRoles.size());
            theseNeutralRoles.add(possibleRoles.get(randomNumber));
        }

        return theseNeutralRoles;
    }

    public ArrayList<String> getTownRoles(int amount){
        return generateRandomTown(amount);
    }

    public ArrayList<String> getNeutralRoles(int amount){
        return generateRandomNeutral(amount);
    }
}
