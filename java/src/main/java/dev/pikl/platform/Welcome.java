package dev.pikl.platform;

import org.springframework.stereotype.Component;

@Component
public class Welcome {

    public String getWelcomeMessage(){
        return "Welcome to PLATFORM";
    }
}
