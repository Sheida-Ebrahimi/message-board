package com.example.webboards;

import com.example.util.Users;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.HTTP;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

// servlet for handling signup creation process in the server
@WebServlet(name = "signupServlet", value = "/signup-servlet")
public class SignupServlet extends HttpServlet {
    // post request
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json"); // json
        // we use a buffer in the form of string builder
        StringBuffer buffer = new StringBuffer();
        String ln;
        // processing post request json
        try {
            BufferedReader read = request.getReader(); // put the request from client in a buffer
            while ((ln = read.readLine()) != null) { // assign to ln string by reading each line and make sure it's not null
                System.out.println("ln = " + ln);
                buffer.append(ln); // put it in the string builder
            }
        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        System.out.println(buffer);
        // trying to make a json object
        JSONObject obj = new JSONObject(buffer.toString());
        System.out.println("json is " + obj);
        // json looks like {"user":"sid", "pwd": "ABC123"}
        String username = obj.getString("user"); // get username
        String password = obj.getString("pwd"); // get the password
        // to do create a Users class
        boolean success = false; // was sign up process complete?
        try {
            if (!(Users.getAccounts().containsKey(username))) { // check if user exists (if doesn't then make the account)
                success = Users.createAccount(username, password); // make the account
            }
        } catch (RuntimeException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        JSONObject jsonResponse = new JSONObject();
        // create a json object which tells whether sign up process was success or fail
        jsonResponse.put("success",success);
        jsonResponse.put("username",username);

        // sending json response back to client
        PrintWriter out = response.getWriter();
        out.print(jsonResponse);
    }

    public void destroy() {
    }
}
