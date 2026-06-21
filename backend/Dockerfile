# Stage 1: build JAR（maven:3.9-eclipse-temurin-17 內建 Maven + JDK 17）
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
# 先下載依賴層（利用 Docker cache，src 變動時不重下載）
RUN mvn dependency:go-offline -q
COPY src ./src
# 打包，跳過測試（測試在 CI 中執行）
RUN mvn package -DskipTests -q

# Stage 2: minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/cinemist-0.0.1.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
