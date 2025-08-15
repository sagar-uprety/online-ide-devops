package edu.tum.cit.sse.project.configuration;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfiguration {

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.name}")
    private String dbName;

    @Value("${spring.datasource.username}")
    private String dbUserName;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${database.port}")
    private String dbPort;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        if (jdbcUrl.isEmpty()) {
            config.setJdbcUrl("jdbc:postgresql://localhost:" + dbPort + "/" + dbName);
            config.setUsername(dbUserName);
            config.setPassword(dbPassword);
        } else {
            config.setJdbcUrl(jdbcUrl);
        }
        return new HikariDataSource(config);
    }
}
