package com.kodarys;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.kodarys.model.Usuario;
import com.sun.net.httpserver.HttpServer;

public class MainHttpServer {
    public static void main(String[] args) {
        int port = 8080;          // agora porta HTTP
        Gson gson = new Gson();

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
            System.out.println("Servidor HTTP rodando na porta " + port + "...");

            // Rota parecida com o “entry point” antigo
            server.createContext("/api/usuario", exchange -> {
                try {
                    System.out.println("Cliente conectado: " + exchange.getRemoteAddress());

                    // CORS básico para o React conseguir acessar
                    exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
                    exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
                    exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");

                    // pré-flight do navegador
                    if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                        exchange.sendResponseHeaders(204, -1);
                        return;
                    }

                    if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                        exchange.sendResponseHeaders(405, -1); // Method Not Allowed
                        System.out.println("Método não permitido: " + exchange.getRequestMethod());
                        return;
                    }

                    // --- LENDO O "JSON" (bem parecido com o BufferedReader do socket) ---
                    BufferedReader in = new BufferedReader(
                            new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8));

                    String json = in.readLine();  // se quiser, pode trocar por readAll
                    System.out.println("Recebido: " + json);

                    String respostaJson;

                    try {
                        Usuario usuario = gson.fromJson(json, Usuario.class);

                        if (usuario != null &&
                                usuario.getNome() != null &&
                                usuario.getEmail() != null) {

                            respostaJson = "{\"status\": \"ok\", \"mensagem\": \"JSON válido.\"}";
                            System.out.println("Usuário válido: " + usuario);
                        } else {
                            respostaJson = "{\"status\": \"erro\", \"mensagem\": \"Campos obrigatórios ausentes.\"}";
                            System.out.println("Usuário inválido (campos faltando).");
                        }
                    } catch (JsonSyntaxException e) {
                        respostaJson = "{\"status\": \"erro\", \"mensagem\": \"JSON inválido.\"}";
                        System.out.println("Erro de sintaxe no JSON.");
                    }

                    // --- ENVIANDO RESPOSTA (equivalente ao PrintWriter do socket) ---
                    byte[] respBytes = respostaJson.getBytes(StandardCharsets.UTF_8);
                    exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
                    exchange.sendResponseHeaders(200, respBytes.length);

                    OutputStream out = exchange.getResponseBody();
                    out.write(respBytes);
                    out.close();

                    System.out.println("Conexão encerrada.\n");

                } catch (Exception e) {
                    e.printStackTrace();
                    String erro = "{\"status\": \"erro\", \"mensagem\": \"Erro interno no servidor.\"}";
                    byte[] respBytes = erro.getBytes(StandardCharsets.UTF_8);
                    exchange.sendResponseHeaders(500, respBytes.length);
                    exchange.getResponseBody().write(respBytes);
                    exchange.getResponseBody().close();
                }
            });

            server.start();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
