package com.example.webboards;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.*;
import com.example.util.*;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@ServerEndpoint(value="/ws/{userId}")
public class SocketServer {
    // Resource file names
    private final String boardFile = "board.json";

    // for single-board test case
    private Board singleBoard = null;
    // session to userId
    private static Map<String,String> users = new HashMap<>();
    // userId to boardId
    // private static Map<String,String> usersBoards = new HashMap<>();
    // private static Map<String,Board> boards = Board.loadAllBoards("board.json");
    @OnOpen
    public void open(@PathParam("userId") String userId, Session session) throws IOException, URISyntaxException {
        System.out.println("Connection established with user: "+userId);

        users.put(session.getId(), userId);
        if(singleBoard==null){
            singleBoard=Board.loadBoard(boardFile);
        }

//        // Get all the user's boardIds and return them
//        JSONObject resp = new JSONObject();
//        JSONArray boardIds = (new JSONObject(Loader.load("users-board.json")))
//                .getJSONArray(userId);
//        resp.put("boards",boardIds);
//        session.getBasicRemote().sendText(resp.toString());

        // return current state of board from file (single board)
        session.getBasicRemote().sendText("Connection established");
        JSONObject resp = new JSONObject()
                .put("board",singleBoard.toJSON())
                .put("type","board");
        session.getBasicRemote().sendText(resp.toString());
    }

    @OnClose
    public void close(Session session) throws FileNotFoundException {
        users.remove(session.getId());
    }

    @OnMessage
    public void message(String comm, Session session) throws IOException {
        System.out.println(comm);
        JSONObject message = new JSONObject(comm);
        String type = message.getString("type");
        switch(type){
            // Create new card
            case "new-card":
                System.out.println("Added card: " + comm);
                //singleBoard.addCard(Card.jsonToCard(message));
                messageAll(session,message.toString());
                break;
            // create new note
            case "new-note":
//                singleBoard.getCards().get(message.getInt("card"))
//                        .addNote(new Note(message.getString("text"),message.getString("creator")));
                messageAll(session, message.toString());
                break;
            // delete note with index
            case "delete-note":
//                singleBoard.getCards().get(message.getInt("card")).deleteNote(message.getInt("note"));
                messageAll(session, message.toString());
                break;
            // delete card with index
            case "delete-card":
                System.out.println("Deleting card: "+comm);
                //singleBoard.getCards().remove(message.getInt("card"));
                //System.out.println("New cards list: " + singleBoard.getCards().toString());
                messageAll(session, message.toString());
                break;
            default:
                session.getBasicRemote().sendText("{\"type\":\"error\", \"text\":\"type not defined\"}");
        }
    }

    public void messageAll(Session session,String message) throws IOException {
        for(Session peer : session.getOpenSessions()){
            if(!peer.getId().equals(session.getId())){
                peer.getBasicRemote().sendText(message);
            }
        }
    }
}
