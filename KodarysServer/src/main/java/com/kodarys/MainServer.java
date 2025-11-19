package com.kodarys;

import java.io.*;
import java.net.*;
import com.google.gson.*;
import com.kodarys.model.Usuario;

public class MainServer {
    public static void main(String[] args) {
        int port = 5000;
        Gson gson = new Gson();

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

                        if (usuario.getNome() != null && usuario.getEmail() != null) {
                            out.println("{\"status\": \"ok\", \"mensagem\": \"JSON válido.\"}");
                            System.out.println("Usuário válido: " + usuario);
                        } else {
                            out.println("{\"status\": \"erro\", \"mensagem\": \"Campos obrigatórios ausentes.\"}");
                        }
                    } catch (JsonSyntaxException e) {
                        out.println("{\"status\": \"erro\", \"mensagem\": \"JSON inválido.\"}");
                    }

                    System.out.println("Conexão encerrada.\n");
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}