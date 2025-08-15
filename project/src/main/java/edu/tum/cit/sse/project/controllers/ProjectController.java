package edu.tum.cit.sse.project.controllers;

import edu.tum.cit.sse.project.models.GitlabUser;
import edu.tum.cit.sse.project.models.Project;
import edu.tum.cit.sse.project.models.SourceFile;
import edu.tum.cit.sse.project.services.ProjectService;
import edu.tum.cit.sse.project.services.SourceFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/project")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private SourceFileService sourceFileService;

    @RequestMapping(method = RequestMethod.GET, path = "/")
    public List<Project> getProjects() {
        return projectService.getAllProjects();
    }

    @RequestMapping(method = RequestMethod.POST, path = "/")
    public Project createProject(@RequestBody Project project) {
        return projectService.createProject(project);
    }

    @RequestMapping(path = "/{projectId}", method = RequestMethod.GET)
    public Project getProject(@PathVariable String projectId) {
        return projectService.findById(projectId);
    }

    @RequestMapping(path = "/{projectId}", method = RequestMethod.PUT)
    public Project updateProject(@PathVariable String projectId, @RequestBody Project project) {
        return projectService.updateProject(projectId, project);
    }

    @RequestMapping(path = "/{projectId}", method = RequestMethod.DELETE)
    public void deleteProject(@PathVariable String projectId) {
        projectService.deleteProject(projectId);
    }

    @RequestMapping(path = "/{projectId}/file", method = RequestMethod.GET)
    public List<SourceFile> getFilesForProject(@PathVariable String projectId) {
        Project project = projectService.findById(projectId);
        return sourceFileService.findAllFilesByProject(project);
    }

    @RequestMapping(path = "/{projectId}/file", method = RequestMethod.POST)
    public SourceFile addFileToProject(@PathVariable String projectId, @RequestBody SourceFile sourceFile) {
        return projectService.addFileToProject(projectId, sourceFile);
    }

    @RequestMapping(path = "/{projectId}/share", method = RequestMethod.PUT)
    public Project shareProjectWithUser(@PathVariable String projectId, @RequestBody GitlabUser user) {
        return projectService.shareProjectWithUser(projectId, user);
    }

}
