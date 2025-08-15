package edu.tum.cit.sse.project.controllers;

import edu.tum.cit.sse.project.models.SourceFile;
import edu.tum.cit.sse.project.services.SourceFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/file")
public class SourceFileController {

    @Autowired
    private SourceFileService sourceFileService;

    @RequestMapping(path = "/{fileId}", method = RequestMethod.PUT)
    public SourceFile updateFile(@PathVariable String fileId,
                                 @RequestBody SourceFile sourceFile) {
        return sourceFileService.updateFile(fileId, sourceFile);
    }

    @RequestMapping(path = "/{fileId}", method = RequestMethod.DELETE)
    public void deleteFile(@PathVariable String fileId) {
        sourceFileService.deleteFile(fileId);
    }

}
