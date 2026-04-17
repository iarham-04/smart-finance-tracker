package com.financetracker.model;

/**
 * DTO / value object representing a smart insight returned to the frontend.
 */
public class Insight {

    private String id;
    private String title;
    private String description;
    private String icon;
    private String color; // "primary" | "secondary" | "error" | "warning"

    public Insight() {}

    public Insight(String id, String title, String description, String icon, String color) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.color = color;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
