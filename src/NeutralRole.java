import java.util.ArrayList;
public class NeutralRole extends Role{
    private ArrayList<String> neutralApocalypse;
    private ArrayList<String> neutralBenign;

    public NeutralRole(String name) {

        super(name);
        this.neutralApocalypse = new ArrayList<>();
        this.neutralBenign = new ArrayList<>();

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

    public ArrayList<String> getNeutralApocalypse() {
        return neutralApocalypse;
    }

    public ArrayList<String> getNeutralBenign() {
        return neutralBenign;
    }
}
