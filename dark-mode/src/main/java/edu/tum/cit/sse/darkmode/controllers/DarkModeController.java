package edu.tum.cit.sse.darkmode.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping(path = "/dark-mode")
public class DarkModeController {
    private boolean darkModeEnabled = false;
    private Instant lastDarkModeToggleTime = null;

    @RequestMapping(path = "/", method = RequestMethod.GET)
    public boolean darkModeEnabled() {
        return this.darkModeEnabled;
    }

    @RequestMapping(path = "/toggle", method = RequestMethod.GET)
    public void toggleDarkMode() {
        if (lastDarkModeToggleTime == null || Instant.now().minusSeconds(5).isAfter(lastDarkModeToggleTime)) {
            lastDarkModeToggleTime = Instant.now();
            this.darkModeEnabled = !this.darkModeEnabled;
        }
    }

}
