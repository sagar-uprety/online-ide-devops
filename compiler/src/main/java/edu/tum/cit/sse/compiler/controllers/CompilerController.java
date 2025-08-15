package edu.tum.cit.sse.compiler.controllers;

import edu.tum.cit.sse.compiler.models.SourceCodeDto;
import edu.tum.cit.sse.compiler.services.CompilerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(path = "/compile")
public class CompilerController {

    @Autowired
    private CompilerService compilerService;

    @RequestMapping(path = "/", method = RequestMethod.POST)
    public SourceCodeDto compile(@RequestBody SourceCodeDto sourceCode) throws IOException {
        return compilerService.compile(sourceCode);
    }

    @RequestMapping(path = "/langs", method = RequestMethod.GET)
    public List<String> getLanguages() {
        return new ArrayList<>(compilerService.getCompilerCommands().keySet());
    }
}
