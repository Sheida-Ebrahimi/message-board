package com.example.webboards;
import com.example.util.Users;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

// this is for handling http request from signin.html form using a POST request
@WebServlet(name = "loginServlet", value = "/login-servlet")
public class LoginServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json"); // we want JSON
        // we use a buffer in the form of string builder
        StringBuilder buffer = new StringBuilder();
        String ln = null; // for reading line
        // processing post request json
        try {
            BufferedReader read = request.getReader(); // put the request from client in a buffer
            while ((ln = read.readLine()) != null) { // assign to ln string by reading each line and make sure it's not null
                System.out.println(ln);
                buffer.append(ln); // put it in the string builder
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }

        // trying to make a json object

//        JSONObject obj;
//        try {
//            obj = HTTP.toJSONObject(buffer.toString());
//            System.out.println(obj.toString());
//        } catch (JSONException e) {
//            // death
//            e.printStackTrace();
//            throw new RuntimeException();
//        }
        // create a json object from the stringbuilder buffer
        JSONObject obj = new JSONObject(buffer.toString());
        // json looks like {"user":"sid", "pwd": "ABC123"}
        String username = obj.getString("user"); // get username
        String password = obj.getString("pwd"); // get the password
        boolean loggedin = false; // not logged in yet
        try{
            loggedin = Users.isValid(username, password); // if password and username match then client can log in
        } catch(RuntimeException e){
            e.printStackTrace();
            throw new RuntimeException(e);
        }

        JSONObject jsonResponse = new JSONObject();
        // put the login status (true or false) in a json and the username too
        jsonResponse.put("loginStatus",loggedin);
        jsonResponse.put("username",username);
        System.out.println(jsonResponse);
        // sending json response back to client
        PrintWriter out = response.getWriter();
        out.print(jsonResponse);
    }

    public void destroy() {
    }
}
