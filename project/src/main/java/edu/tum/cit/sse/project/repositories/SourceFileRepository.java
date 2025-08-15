package edu.tum.cit.sse.project.repositories;

import edu.tum.cit.sse.project.models.Project;
import edu.tum.cit.sse.project.models.SourceFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SourceFileRepository extends JpaRepository<SourceFile, String> {
    List<SourceFile> findAllByProject(Project project);
}
