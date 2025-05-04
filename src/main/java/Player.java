public class Player {
    public String name;
    public Roles role;
    private boolean alive;
    private boolean isHexed;
    private boolean isDoused;
    private boolean isInfected;
    private boolean attacked;

    public Player(String name) {
        this.name = name;
        this.alive = true;
        this.isHexed = false;
        this.isDoused = false;
        this.isInfected = false;
    }

    @Override
    public String toString() {
        return name;
    }

    public void setroles(Roles role) {
        this.role = role;
    }
    
    public Roles getrole() {
        return role;
    }


    public void attack(){
        attacked = true;
    }

    public void kill(){
        alive = false;
    }





}
