package edu.tum.cit.sse.project.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestOperations;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.client.ClientCredentialsResourceDetails;

@Configuration
public class OAuth2Configuration {

    @Bean
    public OAuth2RestOperations restTemplate(OAuth2ClientContext context) {
        ClientCredentialsResourceDetails details = new ClientCredentialsResourceDetails();
        return new OAuth2RestTemplate(details, context);
    }
}
