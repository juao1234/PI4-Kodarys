package com.kodarys;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.bson.Document;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.kodarys.model.Usuario;
import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.github.cdimascio.dotenv.Dotenv;
import org.mindrot.jbcrypt.BCrypt;

public class MainServer {

    private static MongoClient mongoClient;
    private static MongoCollection<Document> usuariosCollection;

    public static void main(String[] args) {
        int port = 5000;
        Gson gson = new Gson();

        inicializarMongo();

        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("Servidor TCP rodando na porta " + port + "...");

            while (true) {
                try (Socket socket = serverSocket.accept()) {
                    System.out.println("Cliente conectado: " + socket.getInetAddress());

                    BufferedReader in = new BufferedReader(
                            new InputStreamReader(socket.getInputStream()));
                    PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

                    String json = in.readLine();
                    System.out.println("Recebido: " + json);

                    try {
                        Usuario usuario = gson.fromJson(json, Usuario.class);

                        if (usuario != null &&
                                usuario.getNome() != null &&
                                usuario.getEmail() != null &&
                                usuario.getSenha() != null &&
                                !usuario.getSenha().isBlank() &&
                                usuario.getIdade() != null &&
                                usuario.getIdade() > 0) {

                            // Gera hash da senha
                            String senhaHash = BCrypt.hashpw(usuario.getSenha(), BCrypt.gensalt());

                            try {
                                // tenta salvar no Mongo
                                salvarNoMongo(usuario, senhaHash);

                                out.println("{\"status\": \"ok\", \"mensagem\": \"JSON válido e salvo no MongoDB.\"}");
                                System.out.println("Usuário válido: " + usuario);
                            } catch (MongoException me) {
                                me.printStackTrace();
                                out.println("{\"status\": \"erro\", \"mensagem\": \"Erro ao salvar no banco de dados.\"}");
                                System.out.println("Erro ao salvar no MongoDB: " + me.getMessage());
                            }

                        } else {
                            out.println("{\"status\": \"erro\", \"mensagem\": \"Campos obrigatórios ausentes ou inválidos.\"}");
                            System.out.println("Usuário inválido (campos obrigatórios ausentes ou inválidos).");
                        }
                    } catch (JsonSyntaxException e) {
                        out.println("{\"status\": \"erro\", \"mensagem\": \"JSON inválido.\"}");
                        System.out.println("Erro de sintaxe no JSON: " + e.getMessage());
                    }

                    System.out.println("Conexão encerrada.\n");
                } catch (IOException e) {
                    e.printStackTrace();
                    System.out.println("Erro ao tratar cliente.");
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("Erro ao iniciar servidor TCP.");
        } finally {
            if (mongoClient != null) {
                mongoClient.close();
            }
        }
    }

    // ---------------------- MONGO + DOTENV ----------------------

    private static void inicializarMongo() {
        Dotenv dotenv = Dotenv.load();

        String uri = dotenv.get("MONGODB_URI");
        String dbName = dotenv.get("DB_NAME");
        String collectionName = dotenv.get("MONGO_COLLECTION");

        if (uri == null || uri.isEmpty()) {
            uri = "mongodb://localhost:27017";
            System.out.println("MONGODB_URI não definido no .env. Usando padrão: " + uri);
        }

        if (dbName == null || dbName.isEmpty()) {
            dbName = "Kodarys";
            System.out.println("DB_NAME não definido no .env. Usando padrão: " + dbName);
        }

        if (collectionName == null || collectionName.isEmpty()) {
            collectionName = "usuarios";
            System.out.println("MONGO_COLLECTION não definido no .env. Usando padrão: " + collectionName);
        }

        mongoClient = MongoClients.create(uri);
        MongoDatabase db = mongoClient.getDatabase(dbName);
        usuariosCollection = db.getCollection(collectionName);

        System.out.println("Conectado ao MongoDB.");
        System.out.println("DB: " + dbName + " | Coleção: " + collectionName);
    }

    private static void salvarNoMongo(Usuario u, String senhaHash) {
        LocalDateTime agora = LocalDateTime.now(ZoneId.of("America/Sao_Paulo"));
        String dataFormatada = agora.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        Document doc = new Document("nome", u.getNome())
                .append("email", u.getEmail())
                .append("idade", u.getIdade())
                .append("senhaHash", senhaHash)
                .append("createdAt", dataFormatada);

        usuariosCollection.insertOne(doc);
        System.out.println("Usuário salvo no MongoDB: " + doc.toJson());
    }
}
