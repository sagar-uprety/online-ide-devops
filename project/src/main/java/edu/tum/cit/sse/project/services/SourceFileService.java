package edu.tum.cit.sse.project.services;

// import com.netflix.discovery.converters.Auto;
import edu.tum.cit.sse.project.models.Project;
import edu.tum.cit.sse.project.models.SourceFile;
import edu.tum.cit.sse.project.repositories.SourceFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import javax.xml.ws.http.HTTPException;
import java.util.List;

@Service
public class SourceFileService {

    @Autowired
    private SourceFileRepository sourceFileRepository;

    @Autowired
    private PermissionService permissionService;

    @PostAuthorize("returnObject.project.hasUserIdAccess(authentication.name)")
    public SourceFile getSourceFile(String fileId) {
        return sourceFileRepository.findById(fileId).orElseThrow(() -> new HTTPException(404));
    }

    @Transactional
    @PostFilter("filterObject.project.hasUserIdAccess(authentication.name)")
    public List<SourceFile> findAllFilesByProject(Project project) {
        return sourceFileRepository.findAllByProject(project);
    }

    public SourceFile updateFile(String fileId, SourceFile sf) {
        SourceFile sourceFile = permissionService.getSourceFile(fileId);
        // do nothing if equal
        if (sourceFile.getFileName().equals(sf.getFileName()) && sourceFile.getCode().equals(sf.getCode())) {
            return sourceFile;
        }
        sourceFile.setFileName(sf.getFileName());
        sourceFile.setCode(sf.getCode());
        sourceFileRepository.save(sourceFile);
        return sourceFile;
    }

    public void deleteFile(String fileId) {
        SourceFile sourceFile = permissionService.getSourceFile(fileId);
        sourceFileRepository.delete(sourceFile);
    }

    public SourceFile saveSourceFile(SourceFile sf, Project project) {
        SourceFile sourceFile = new SourceFile();
        sourceFile.setProject(project);
        sourceFile.setFileName(sf.getFileName());
        sourceFile.setCode(sf.getCode());
        return sourceFileRepository.save(sourceFile);
    }

}
