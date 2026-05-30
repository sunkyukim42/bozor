package com.bozorcheck;

import static org.assertj.core.api.Assertions.assertThat;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class DatabaseMigrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void contextLoadsAndFlywayMigrationsApply() {
        assertThat(flyway.info().current().getVersion().getVersion()).isEqualTo("2");

        Integer productCount = jdbcTemplate.queryForObject("select count(*) from products", Integer.class);
        Integer observationCount = jdbcTemplate.queryForObject("select count(*) from price_observations", Integer.class);

        assertThat(productCount).isNotNull().isGreaterThanOrEqualTo(10);
        assertThat(observationCount).isNotNull().isGreaterThanOrEqualTo(10);
    }
}
