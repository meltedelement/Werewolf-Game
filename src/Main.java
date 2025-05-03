public class Main {
    public static void main(String[] args) {
        Game test = new Game(false);

        System.out.println(test.getTownRoles(5));
        System.out.println(test.getNeutralRoles(2));
    }
}
