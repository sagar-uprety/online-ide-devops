FROM maven:3.9.6-amazoncorretto-8 AS build

WORKDIR /build

# Download dependencies first to cache them
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src src
RUN mvn clean package -DskipTests

FROM amazoncorretto:8u412-alpine3.19-jre
WORKDIR /app
RUN apk add --no-cache build-base=0.5-r3 clang16=16.0.6-r5

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /build/target/*.jar app.jar

ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","app.jar"]
