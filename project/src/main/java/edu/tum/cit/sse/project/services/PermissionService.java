package edu.tum.cit.sse.project.services;

import edu.tum.cit.sse.project.models.Project;
import edu.tum.cit.sse.project.models.SourceFile;
import edu.tum.cit.sse.project.repositories.ProjectRepository;
import edu.tum.cit.sse.project.repositories.SourceFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.xml.ws.http.HTTPException;

@Service
public class PermissionService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SourceFileRepository sourceFileRepository;

    public String getCurrentUserId() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();
        return authentication.getName();
    }

    @PostAuthorize("returnObject.hasUserIdAccess(authentication.name)")
    public Project findById(String projectId) {
        return projectRepository.findById(projectId).orElseThrow(() -> new HTTPException(404));
    }

    @PostAuthorize("returnObject.project.hasUserIdAccess(authentication.name)")
    public SourceFile getSourceFile(String fileId) {
        return sourceFileRepository.findById(fileId).orElseThrow(() -> new HTTPException(404));
    }
}
