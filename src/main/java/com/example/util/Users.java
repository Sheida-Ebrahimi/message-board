package com.example.util;

import java.util.HashMap;

public class Users {
    // Keeps track of users entered into the system
    protected static HashMap<String, String> accounts = new HashMap<>();

    public static boolean createAccount(String username, String password) throws RuntimeException {
        if (!(username.equals("") || password.equals(""))) {
            accounts.put(username, password);
            return true;
        } else {
            throw new RuntimeException();
        }
    }
    // Checks if user, passsword combo is an existing entry in the system
    public static boolean isValid(String username, String password) {
        String pwd = accounts.get(username);
        if(pwd == null){
            return false;
        }
        return pwd.equals(password);
    }

    public static HashMap<String, String> getAccounts() {
        return accounts;
    }
}
