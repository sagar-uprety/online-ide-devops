package edu.tum.cit.sse.project.services;

import edu.tum.cit.sse.project.models.GitlabUser;
import edu.tum.cit.sse.project.models.Project;
import edu.tum.cit.sse.project.models.SourceFile;
import edu.tum.cit.sse.project.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.oauth2.client.OAuth2RestOperations;
import org.springframework.stereotype.Service;

import javax.xml.ws.http.HTTPException;
import java.util.List;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private SourceFileService sourceFileService;

    @Autowired
    private OAuth2RestOperations restTemplate;

    @PostFilter("filterObject.hasUserIdAccess(authentication.name)")
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project createProject(Project project) {
        String userId = permissionService.getCurrentUserId();
        project.addUserId(userId);
        return projectRepository.save(project);
    }

    @PostAuthorize("returnObject.hasUserIdAccess(authentication.name)")
    public Project findById(String projectId) {
        return projectRepository.findById(projectId).orElseThrow(() -> new HTTPException(404));
    }

    public SourceFile addFileToProject(String projectId, SourceFile sourceFile) {
        Project project = permissionService.findById(projectId);
        return sourceFileService.saveSourceFile(sourceFile, project);
    }

    public Project shareProjectWithUser(String projectId, GitlabUser user) {
        Project project = permissionService.findById(projectId);
        GitlabUser[] users = restTemplate.getForObject("https://gitlab.lrz.de/api/v4/search?scope=users&search=" + user.getUsername(), GitlabUser[].class);
        if (users != null) {
            for (GitlabUser u : users) {
                if (u.getUsername().equals(user.getUsername())) {
                    project.addUserId(user.getUsername());
                    project = projectRepository.save(project);
                    break;
                }
            }
        }
        return project;
    }

    public Project updateProject(String projectId, Project project) {
        Project p = permissionService.findById(projectId);
        p.setName(project.getName());
        return projectRepository.save(p);
    }

    public void deleteProject(String projectId) {
        Project p = permissionService.findById(projectId);
        List<SourceFile> sourceFiles = sourceFileService.findAllFilesByProject(p);
        for (SourceFile sourceFile : sourceFiles) {
            sourceFileService.deleteFile(sourceFile.getId());
        }
        projectRepository.delete(p);
    }
}
