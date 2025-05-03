import java.util.ArrayList;

public class WerewolfRole extends Role{
    private final ArrayList<String > werewolfList;

    public WerewolfRole(String name) {
        super(name);
        this.werewolfList = new ArrayList<>();
        makeWerewolfList();

    }

    private void makeWerewolfList()
    {
        werewolfList.add("Werewolf");
        werewolfList.add("Hexwolf");
        werewolfList.add("Mistwolf");
        werewolfList.add("Wolf Cub");
        werewolfList.add("Sorcerer");
        werewolfList.add("Consort");
    }

    public ArrayList<String> getWerewolfList() {
        return werewolfList;
    }
}
