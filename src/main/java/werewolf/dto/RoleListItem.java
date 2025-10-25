package werewolf.dto;

public class RoleListItem {
    private String type; // "SPECIFIC" or "CATEGORY"
    private String value; // Role name (e.g., "Seer") or category name (e.g., "TOWN_INVESTIGATIVE")
    private Integer count; // Number of this role/category to add (defaults to 1)

    public RoleListItem() {
        this.count = 1;
    }

    public RoleListItem(String type, String value) {
        this.type = type;
        this.value = value;
        this.count = 1;
    }

    public RoleListItem(String type, String value, Integer count) {
        this.type = type;
        this.value = value;
        this.count = count;
    }

    // Getters and setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
