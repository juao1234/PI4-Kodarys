package com.kodarys;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.kodarys.model.Usuario;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

public class MainHttpServer {

    private static final int PORT = 8080;
    private static final Gson gson = new Gson();

    public static void main(String[] args) throws Exception {
        iniciarServidorHTTP();
    }

    // ---------------------- SERVIDOR HTTP ----------------------

    private static void iniciarServidorHTTP() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        server.createContext("/api/usuario", MainHttpServer::handleUsuario);

        server.start();
        System.out.println("Servidor HTTP rodando na porta " + PORT + "...");
    }

    private static void handleUsuario(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();

            // CORS — necessário para React conseguir chamar o servidor
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");

            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(405, -1); // Method Not Allowed
                return;
            }

            // Lê o JSON vindo do React
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            System.out.println("HTTP Recebido: " + body);

            // Processa JSON e gera resposta
            String respostaJson = processarJsonUsuario(body);

            byte[] respBytes = respostaJson.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(200, respBytes.length);

            OutputStream os = exchange.getResponseBody();
            os.write(respBytes);
            os.close();

        } catch (Exception e) {
            e.printStackTrace();
            String erro = "{\"status\":\"erro\",\"mensagem\":\"Erro interno no servidor.\"}";
            byte[] respBytes = erro.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(500, respBytes.length);
            exchange.getResponseBody().write(respBytes);
            exchange.getResponseBody().close();
        }
    }

    // ---------------------- VALIDAÇÃO + RESPOSTA ----------------------

    private static String processarJsonUsuario(String json) {
        try {
            Usuario usuario = gson.fromJson(json, Usuario.class);

            if (usuario != null &&
                usuario.getNome() != null &&
                usuario.getEmail() != null) {

                // Aqui seria a parte do Mongo, agora removida.
                System.out.println("Usuário recebido: " + usuario);

                return "{\"status\":\"ok\",\"mensagem\":\"Usuário recebido com sucesso.\"}";
            } else {
                return "{\"status\":\"erro\",\"mensagem\":\"Campos obrigatórios ausentes.\"}";
            }

        } catch (JsonSyntaxException e) {
            return "{\"status\":\"erro\",\"mensagem\":\"JSON inválido.\"}";
        }
    }
}
