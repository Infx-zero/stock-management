# Use official Java image
FROM eclipse-temurin:17-jdk-jammy

# Copy jar file
COPY target/*.jar app.jar

# Run the application
ENTRYPOINT ["java","-jar","/app.jar"]
