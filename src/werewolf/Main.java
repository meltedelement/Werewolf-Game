public class Main {
    public static void main(String[] args) {
        Game test = new Game(true);

        test.addPlayer("Yasmin");
        test.addPlayer("Jame");
        test.addPlayer("April");
        test.addPlayer("Skye");
        test.addPlayer("Ciaran");
        test.addPlayer("Anna");
        test.addPlayer("Holly");
        test.addPlayer("David");
        test.addPlayer("Aoibheann");
        test.addPlayer("Eoin");

        test.setWerewolfRatio(4);
        test.setNeutralRatio(3);
        test.setTownRatio(2);

        test.makeRandomRoles();

        for(int i=0; i<test.getGameRoles().size(); i++){
            System.out.println(test.getPlayers().get(i) + ": " + test.getGameRoles().get(i));
        }

        System.out.println();

        test.setWerewolfRatio(1);
        test.setNeutralRatio(0);
        test.setTownRatio(1);

        test.makeRandomRoles();

        for(int i=0; i<test.getGameRoles().size(); i++){
            System.out.println(test.getPlayers().get(i) + ": " + test.getGameRoles().get(i));
        }

    }
}
