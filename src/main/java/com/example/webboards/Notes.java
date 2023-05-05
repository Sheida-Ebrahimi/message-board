package com.example.webboards;

public class Notes {
    private int id;
    private String body;

    Notes(int id, String body) {
        this.id = id;
        this.body = body;
    }

    public static Notes[] fromHTML(String payload) {
        // to do (WIP)
        Notes[] notes = new Notes[1];
        Notes note = new Notes(0,"test-body-please-change-Notes.fromHTML plus here is payload: " + payload);
        notes[0] = note;
        return notes;
    }

    public int getId() {
        return this.id;
    }
    public String getBody() {
        return this.body;
    }

    public void setId(int id) {
        this.id = id;
    }
    public void setBody(String body) {
        this.body = body;
    }

}
