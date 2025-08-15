package edu.tum.cit.sse.project.models;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;


@JsonSerialize(using = GitlabUser.GitlabUserSerializer.class)
public class GitlabUser {
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String state;

    private String avatar_url;
    private String web_url;

    public GitlabUser() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAvatar_url() {
        return avatar_url;
    }

    public void setAvatar_url(String avatar_url) {
        this.avatar_url = avatar_url;
    }

    public String getWeb_url() {
        return web_url;
    }

    public void setWeb_url(String web_url) {
        this.web_url = web_url;
    }

    public static class GitlabUserSerializer extends StdSerializer<GitlabUser> {

        public GitlabUserSerializer() {
            this(null);
        }

        public GitlabUserSerializer(Class<GitlabUser> t) {
            super(t);
        }

        @Override
        public void serialize(
                GitlabUser value, JsonGenerator jgen, SerializerProvider provider)
                throws IOException {

            jgen.writeStartObject();
            jgen.writeStringField("username", value.getUsername());
            jgen.writeEndObject();
        }
    }
}
