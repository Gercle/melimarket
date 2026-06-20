package com.melimarket.worker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // necesario para que @Scheduled funcione
public class MelimarketWorkerApplication {
    public static void main(String[] args) {
        SpringApplication.run(MelimarketWorkerApplication.class, args);
    }
}
