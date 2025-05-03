public class Main {
    public static void main(String[] args) {
        Game test = new Game(true);

        test.addPlayer("Yasmin");
        test.addPlayer("Sarah");
        test.addPlayer("Jame");
        test.addPlayer("Aaron");
        test.addPlayer("April");
        test.addPlayer("Skye");
        test.addPlayer("Ciaran");
        test.addPlayer("Anna");
        test.addPlayer("Holly");
        test.addPlayer("David");
        test.addPlayer("Aoibheann");
        test.addPlayer("Cockmaster");

        test.setWerewolfRatio(2);
        test.setNeutralRatio(40);
        test.setTownRatio(2);

        test.makeRandomRoles();

        for(int i=0; i<test.getGameRoles().size(); i++){
            System.out.println(test.getPlayers().get(i) + ": " + test.getGameRoles().get(i));
        }

        System.out.println();

//        test.setWerewolfRatio(2);
//        test.setNeutralRatio(0);
//        test.setTownRatio(1);
//
//        test.makeRandomRoles();
//
//        for(int i=0; i<test.getGameRoles().size(); i++){
//            System.out.println(test.getPlayers().get(i) + ": " + test.getGameRoles().get(i));
//        }

    }
}
