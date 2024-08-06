package dev.pikl.platform;

import dev.pikl.platform.run.Location;
import dev.pikl.platform.run.Run;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@SpringBootApplication
public class Application {

	private static final Logger log = LoggerFactory.getLogger(Application.class);

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
		log.info("Application started successfully!");




	}

	@Bean
	CommandLineRunner runner() {
		return args -> {
			Run run = new Run(1,"First", LocalDateTime.now(),LocalDateTime.now().plus(1, ChronoUnit.HOURS),5, Location.OUTDOOR);
			log.info("Run: "+ run);
		};
	}

}
