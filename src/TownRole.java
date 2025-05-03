import java.util.ArrayList;

public class TownRole extends Role{

    private final ArrayList<String> townInvestigativeList;
    private final ArrayList<String> townProtectiveList;
    private final ArrayList<String> townNegativeList;
    private final ArrayList<String> townKillingList;

    public TownRole(String name) {
        super(name);
        this.townInvestigativeList = new ArrayList<>();
        this.townKillingList = new ArrayList<>();
        this.townNegativeList = new ArrayList<>();
        this.townProtectiveList = new ArrayList<>();
        makeTownInvestigativeList();
        makeTownKillingList();
        makeTownProtectiveList();
        makeTownNegativeList();
    }

    private void makeTownInvestigativeList(){
        townInvestigativeList.add("Seer");
        townInvestigativeList.add("Aura Seer");
        townInvestigativeList.add("Private Investigator");
        townInvestigativeList.add("Tracker");
        townInvestigativeList.add("Clock Master");
    }

    private void makeTownProtectiveList(){
        townProtectiveList.add("Bodyguard");
        townProtectiveList.add("Troublemaker");
        townProtectiveList.add("Escort");
        townProtectiveList.add("Witch");
    }

    private void makeTownNegativeList(){
        townNegativeList.add("Cupid");
        townNegativeList.add("Lycan");
        townNegativeList.add("Cursed");
        townNegativeList.add("Atheist");
    }

    private void makeTownKillingList(){
        townKillingList.add("Deputy");
        townKillingList.add("Hunter");
        townKillingList.add("Vigilante");
        townKillingList.add("Veteran");
    }

    public ArrayList<String> getTownInvestigativeList() {
        return townInvestigativeList;
    }

    public ArrayList<String> getTownKillingList() {
        return townKillingList;
    }

    public ArrayList<String> getTownNegativeList() {
        return townNegativeList;
    }

    public ArrayList<String> getTownProtectiveList() {
        return townProtectiveList;
    }
}
