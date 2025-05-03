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

        test.makeRandomRoles();

        for(int i=0; i<test.getPlayers().size(); i++){
            System.out.println(test.getPlayers().get(i) + ": " + test.getGameRoles().get(i));
        }

    }
}
