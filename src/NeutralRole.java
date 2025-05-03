import java.util.ArrayList;
public class NeutralRole extends Role{
    private ArrayList<String> neutralApocalypse;
    private ArrayList<String> neutralBenign;
    public NeutralRole(String name) {

        super(name);
        makeNeutralApocalypse();
        makeNeutralBenign();
    }

    private void makeNeutralApocalypse()
    {
        neutralApocalypse.add("Arsonist");
        neutralApocalypse.add("Plague-bearer");
        neutralApocalypse.add("Grave Digger");
        neutralApocalypse.add("Doom Sayer");
        neutralApocalypse.add("Serial Killer");
    }
    private void makeNeutralBenign()
    {
        neutralBenign.add("Tanner");
        neutralBenign.add("Doppelganger");
        neutralBenign.add("Executioner");

    }
}
