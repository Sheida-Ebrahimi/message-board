package com.example.util;

import org.json.JSONException;
import org.json.JSONObject;

public class Note {
    String text;
    String creator;

    public Note(String text, String creator) {
        this.text = text;
        this.creator = creator;
    }

    // Convert JSONObject to an instance of Note
    public static Note jsonToNote(JSONObject note){
        Note msg = null;
        try {
            msg = new Note(note.getString("text"), note.getString("creator"));
        } catch(JSONException e){
            throw new JSONException(e);
        }
        return msg;
    }
}
