package com.kodarys;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

public class HttpToTcpServer {

    // Porta HTTP (para o React)
    private static final int HTTP_PORT = 8080;

    // Host/porta do servidor TCP
    private static final String TCP_HOST = "localhost";
    private static final int TCP_PORT = 5000;

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(HTTP_PORT), 0);
        System.out.println("Adaptador HTTP para TCP rodando na porta " + HTTP_PORT + "...");

        // Cadastro de usuário
        server.createContext("/api/usuario", HttpToTcpServer::handleUsuario);

        // 🔐 Login de usuário (usa o MESMO handler, só muda o path)
        server.createContext("/api/usuario/login", HttpToTcpServer::handleUsuario);

        // Eventos (dialogo, tentativa, etc) - JSON com "tipo"
        server.createContext("/api/evento", HttpToTcpServer::handleUsuario);

        // Progresso (GET)
        server.createContext("/api/progresso", HttpToTcpServer::handleProgresso);

        server.start();
    }

    // ---------------------- CRUD/Evento via POST ----------------------

    private static void handleUsuario(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();

            // CORS pro React funcionar
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS, GET");

            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"POST".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(405, -1); // Method Not Allowed
                return;
            }

            // Lê o JSON que veio do React
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            System.out.println("HTTP Recebido (do React): " + body);

            // 🔁 Repassa esse JSON para o servidor TCP
            String respostaDoServidorTcp = enviarParaServidorTCP(body);

            // Devolve pro React exatamente o JSON que o TCP retornar
            byte[] respBytes = respostaDoServidorTcp.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(200, respBytes.length);

            OutputStream os = exchange.getResponseBody();
            os.write(respBytes);
            os.close();

        } catch (Exception e) {
            e.printStackTrace();
            String erro = "{\"status\":\"erro\",\"mensagem\":\"Erro interno no adaptador HTTP→TCP.\"}";
            byte[] respBytes = erro.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(500, respBytes.length);
            exchange.getResponseBody().write(respBytes);
            exchange.getResponseBody().close();
        }
    }

    // ---------------------- Progresso via GET ----------------------

    private static void handleProgresso(HttpExchange exchange) throws IOException {
        try {
            String method = exchange.getRequestMethod();

            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");

            if ("OPTIONS".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            if (!"GET".equalsIgnoreCase(method)) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            String query = exchange.getRequestURI().getQuery();
            String idUsuario = extrairQueryParam(query, "id_usuario");

            if (idUsuario == null || idUsuario.isEmpty()) {
                byte[] respBytes = "{\"status\":\"erro\",\"mensagem\":\"id_usuario obrigatório\"}"
                        .getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(400, respBytes.length);
                exchange.getResponseBody().write(respBytes);
                exchange.getResponseBody().close();
                return;
            }

            String payload = "{\"tipo\":\"progresso_get\",\"id_usuario\":\"" + idUsuario + "\"}";
            String respostaDoServidorTcp = enviarParaServidorTCP(payload);

            byte[] respBytes = respostaDoServidorTcp.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(200, respBytes.length);

            OutputStream os = exchange.getResponseBody();
            os.write(respBytes);
            os.close();
        } catch (Exception e) {
            e.printStackTrace();
            String erro = "{\"status\":\"erro\",\"mensagem\":\"Erro interno no adaptador HTTP→TCP.\"}";
            byte[] respBytes = erro.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(500, respBytes.length);
            exchange.getResponseBody().write(respBytes);
            exchange.getResponseBody().close();
        }
    }

    private static String extrairQueryParam(String query, String key) {
        if (query == null || query.isEmpty()) return null;
        String[] pairs = query.split("&");
        for (String p : pairs) {
            String[] kv = p.split("=");
            if (kv.length == 2 && kv[0].equals(key)) {
                return java.net.URLDecoder.decode(kv[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    // ---------------------- Fala com o servidor TCP ----------------------

    private static String enviarParaServidorTCP(String json) throws IOException {
        try (Socket socket = new Socket(TCP_HOST, TCP_PORT)) {
            System.out.println("Conectado ao servidor TCP " + TCP_HOST + ":" + TCP_PORT);

            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));

            out.println(json);

            String resposta = in.readLine();
            System.out.println("Resposta do servidor TCP: " + resposta);

            return resposta != null
                    ? resposta
                    : "{\"status\":\"erro\",\"mensagem\":\"Sem resposta do servidor TCP.\"}";
        }
    }
}
