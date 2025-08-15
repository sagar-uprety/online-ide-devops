package edu.tum.cit.sse.project.models;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_project")
public class Project {
    @Id
    @GeneratedValue(generator = "system-uuid")
    @GenericGenerator(name = "system-uuid", strategy = "uuid")
    @Column(name = "project_id")
    private String id;

    @Column(name = "name")
    private String name;

    @ElementCollection
    @CollectionTable(name = "project_project_users", joinColumns = @JoinColumn(name = "id"))
    @Column(name = "userIds")
    private Set<String> userIds = new HashSet<>();

    public Project() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<String> getUserIds() {
        return userIds;
    }

    public void setUserIds(Set<String> userIds) {
        this.userIds = userIds;
    }

    public void addUserId(String userId) {
        userIds.add(userId);
    }

    public void removeUserId(String userId) {
        userIds.remove(userId);
    }

    public boolean hasUserIdAccess(String userId) {
        for (String uid : userIds) {
            if (uid.equals(userId)) {
                return true;
            }
        }
        return false;
    }
}
