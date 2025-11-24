package com.kodarys;

import java.io.*;
import java.net.*;
import com.google.gson.Gson;
import com.kodarys.model.Usuario;

public class ClienteTCP {
    public static void main(String[] args) {
        String host = "localhost";
        int port = 5000;

        try (Socket socket = new Socket(host, port)) {
            System.out.println("Conectado ao servidor " + host + ":" + port);

            Usuario usuario = new Usuario();
            usuario.setNome("Raul");
            usuario.setIdade(21);
            usuario.setEmail("raul@teste.com");

            Gson gson = new Gson();
            String json = gson.toJson(usuario);

            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
            out.println(json);

            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            String resposta = in.readLine();
            System.out.println("Resposta do servidor: " + resposta);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
