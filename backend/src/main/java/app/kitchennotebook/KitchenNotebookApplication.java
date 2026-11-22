package app.kitchennotebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class KitchenNotebookApplication {

    public static void main(String[] args) {
        SpringApplication.run(KitchenNotebookApplication.class, args);
    }
}
