//package com.platform.demo.models;
//
//import javax.persistence.Entity;
//import javax.persistence.GeneratedValue;
//import javax.persistence.GenerationType;
//import javax.persistence.Id;
//import javax.persistence.Table;
//import java.util.Date;
//
//@Entity
//@Table(name = "users")
//public class User {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private int id;
//    private String name;
//    private String lastname;
//    private String email;
//    private String password;
//    private String joineddate;
//    private String birthday;
//    private String lastonline;
//    private String number;
//
//    public User(String name, String lastname, String password, String email, String joineddate, String birthday, String lastonline, String number) {
//        //this.id = id;
//        this.name = name;
//        this.lastname = lastname;
//        this.password = password;
//        this.email = email;
//        this.joineddate = joineddate;
//        this.birthday = birthday;
//        this.lastonline = lastonline;
//        this.number = number;
//    }
//
//    public User() {
//        //this.id = id;
//        this.name = "";
////        this.lastname = "";
//        this.password = "";
//        this.email = "";
//        this.joineddate = "";
//        this.birthday = "";
//        this.lastonline = "";
//        this.number = "";
//    }
//
//
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public String getLastname() {
//        return lastname;
//    }
//
//    public void setLastname(String lastname) {
//        this.lastname = lastname;
//    }
//
//    public String getEmail() {
//        return email;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public String getPassword() {
//        return password;
//    }
//
//    public void setPassword(String password) {
//        this.password = password;
//    }
//
////    public Date getJoineddate() {
////        return joineddate;
////    }
////
////    public void setJoineddate(Date joineddate) {
////        this.joineddate = joineddate;
////    }
////
////    public Date getBirthday() {
////        return birthday;
////    }
////
////    public void setBirthday(Date birthday) {
////        this.birthday = birthday;
////    }
////
////    public Date getLastonline() {
////        return lastonline;
////    }
////
////    public void setLastonline(Date lastonline) {
////        this.lastonline = lastonline;
////    }
//
//    public String getNumber() {
//        return number;
//    }
//
//    public void setNumber(String number) {
//        this.number = number;
//    }
//}
