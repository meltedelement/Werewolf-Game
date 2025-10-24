public class Main {
    public static void mvnmain(String[] args) {
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

        // Generate random roles based on player count
        test.makeRandomRoles();

        for(int i=0; i<test.getGameRoles().size(); i++){
            System.out.println(test.getPlayers().get(i) + ": " + test.getGameRoles().get(i));
        }

    }
}
