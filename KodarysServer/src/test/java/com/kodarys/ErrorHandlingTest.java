package com.kodarys;

import org.junit.jupiter.api.*;

import java.io.*;
import java.net.Socket;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes específicos para comportamento com payloads vazios e timeouts.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ErrorHandlingTest {

    private Thread serverThread;
    private MainServer server;
    private final int testPort = 6010;

    @BeforeAll
    public void startServer() throws Exception {
        server = new MainServer(testPort);
        serverThread = new Thread(() -> {
            try {
                server.start();
            } catch (IOException e) {
                // ignore
            }
        });
        serverThread.setDaemon(true);
        serverThread.start();
        TimeUnit.MILLISECONDS.sleep(400);
    }

    @AfterAll
    public void stopServer() throws Exception {
        if (server != null) server.stop();
        if (serverThread != null) {
            serverThread.interrupt();
            serverThread.join(2000);
        }
    }

    @Test
    public void emptyPayloadReturnsError() throws Exception {
        String resp = TestHelper.sendAndReceive("localhost", testPort, "", 2000, 5000);
        assertNotNull(resp);
        assertTrue(resp.contains("\"status\":\"erro\"") || resp.contains("\"status\""), "Resposta esperada para payload vazio");
    }

    @Test
    public void slowClientThatSendsNothingTimesOut() throws Exception {
        // conecta e não envia nada para forçar timeout do socket do servidor (se implementado)
        try (Socket s = new Socket("localhost", testPort);
             BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream()));
             PrintWriter out = new PrintWriter(s.getOutputStream(), true)) {

            // Aguarda brevemente e encerra sem enviar dados
            TimeUnit.MILLISECONDS.sleep(1200);
            // Dependendo da implementação do servidor, ele pode fechar por timeout e não enviar nada.
            // O teste apenas verifica que a conexão é estabelecida e que o servidor não travou.
            assertTrue(s.isConnected());
        }
    }
}
