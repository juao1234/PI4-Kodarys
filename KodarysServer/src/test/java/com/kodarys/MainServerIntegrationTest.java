package com.kodarys;

import org.junit.jupiter.api.*;

import java.io.IOException;
import java.net.Socket;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integração com MainServer: inicia o servidor em porta 6000 (isolada para testes),
 * conecta via socket real e envia JSONs para validar respostas de sucesso e erro.
 *
 * Requisitos: MainServer deve ter construtor MainServer(int) e métodos start() e stop().
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MainServerIntegrationTest {

    private Thread serverThread;
    private MainServer server;
    private final int testPort = 6000;

    @BeforeAll
    public void startServer() throws Exception {
        server = new MainServer(testPort);
        serverThread = new Thread(() -> {
            try {
                server.start();
            } catch (IOException e) {
                // server.stop() fecha o ServerSocket e causa IOException ao aceitar; é esperado ao parar
            }
        }, "test-main-server-thread");
        serverThread.setDaemon(true);
        serverThread.start();

        // Espera servidor inicializar (ajustável)
        TimeUnit.MILLISECONDS.sleep(500);

        // Verifica se a porta está aberta (tenta conectar rapidamente)
        try (Socket s = new Socket("localhost", testPort)) {
            // conectado com sucesso -> ok
        } catch (IOException e) {
            // Falha na conexão aborta os testes
            fail("Não foi possível conectar ao servidor na porta de teste " + testPort + ". Erro: " + e.getMessage());
        }
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
    public void validJsonShouldReturnStatus() throws Exception {
        String json = "{\"nome\":\"Teste\",\"idade\":30,\"email\":\"t@t.com\",\"senha\":\"abc\"}";
        String resp = TestHelper.sendAndReceive("localhost", testPort, json, 2000, 5000);
        assertNotNull(resp, "Resposta não pode ser nula para JSON válido");
        assertTrue(resp.contains("\"status\""), "Resposta deve conter campo status");
        assertTrue(resp.contains("\"mensagem\""), "Resposta deve conter campo mensagem");
    }

    @Test
    public void invalidJsonShouldReturnErrorStatus() throws Exception {
        String badJson = "{nome: 'oops'}";
        String resp = TestHelper.sendAndReceive("localhost", testPort, badJson, 2000, 5000);
        assertNotNull(resp);
        assertTrue(resp.contains("\"status\":\"erro\""), "Resposta para JSON inválido deve ter status erro. Resposta: " + resp);
    }

    @Test
    public void missingFieldsShouldReturnErrorMessage() throws Exception {
        String json = "{\"nome\":\"SomenteNome\"}";
        String resp = TestHelper.sendAndReceive("localhost", testPort, json, 2000, 5000);
        assertNotNull(resp);
        assertTrue(resp.contains("\"status\":\"erro\""), "Resposta para campos faltando deve indicar erro");
        // espera mensagem de validação (email obrigatório ou idade obrigatória)
        assertTrue(resp.contains("email") || resp.contains("idade") || resp.contains("obrigat"), "Mensagem de erro deve mencionar campo faltante. Resposta: " + resp);
    }

    @Test
    public void serverHandlesMultipleSequentialConnections() throws Exception {
        // Enviar 5 conexões simples sequenciais para garantir que loop accept continua funcionando
        for (int i = 0; i < 5; i++) {
            String json = String.format("{\"nome\":\"U%d\",\"idade\":%d,\"email\":\"u%d@test.com\"}", i, 20 + i, i);
            String resp = TestHelper.sendAndReceive("localhost", testPort, json, 2000, 5000);
            assertNotNull(resp);
            assertTrue(resp.contains("\"status\""));
        }
    }
}
