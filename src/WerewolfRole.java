import java.util.ArrayList;

public class WerewolfRole extends Role{
    private ArrayList<String > werewolfList;
    public WerewolfRole(String name) {

        super(name);
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
}
