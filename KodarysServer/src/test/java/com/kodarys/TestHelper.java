package com.kodarys;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.concurrent.TimeUnit;

/**
 * Helper simples para testes: conecta no host/port, envia uma linha,
 * lê a resposta (primeira linha) e fecha.
 */
public final class TestHelper {

    private TestHelper() {}

    public static String sendAndReceive(String host, int port, String payload, int connectTimeoutMillis, int readTimeoutMillis) throws Exception {
        Socket s = new Socket();
        try {
            s.connect(new java.net.InetSocketAddress(host, port), connectTimeoutMillis);
            s.setSoTimeout(readTimeoutMillis);
            try (PrintWriter out = new PrintWriter(s.getOutputStream(), true);
                 BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream()))) {

                out.println(payload);
                String resp = in.readLine();
                return resp;
            }
        } finally {
            try { s.close(); } catch (Exception ignored) {}
            // garantir mínimo de espera entre conexões em alguns ambientes CI/locais
            try { TimeUnit.MILLISECONDS.sleep(50); } catch (InterruptedException ignored) {}
        }
    }
}
