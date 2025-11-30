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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.bson.Document;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;
import com.kodarys.model.Dialogo;
import com.kodarys.model.HistoricoMissao;
import com.kodarys.model.Usuario;
import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.model.Filters;

import io.github.cdimascio.dotenv.Dotenv;
import org.mindrot.jbcrypt.BCrypt;

public class MainServer {

    private static MongoClient mongoClient;
    private static MongoCollection<Document> usuariosCollection;
    private static MongoCollection<Document> historicoMissoesCollection;
    private static MongoCollection<Document> estadoNarrativaCollection;
    private static final String[] MISSION_SEQUENCE = new String[] {
            "M01_INTRO", "M02_VARIAVEIS", "M03_INPUT", "M04_OPERADORES"
    };

    // ======= CAMPOS PARA START/STOP DO SERVIDOR =========
    private ServerSocket serverSocket;
    private boolean running = false;
    private int port;

    public MainServer(int port) {
        this.port = port;
    }

    // ======================================================
    // ================== MÉTODO START ======================
    // ======================================================
    public void start() throws IOException {
        inicializarMongo();

        serverSocket = new ServerSocket(port);
        running = true;

        System.out.println("Servidor TCP rodando na porta " + port + "...");

        Gson gson = new Gson();

        while (running) {
            try (Socket socket = serverSocket.accept()) {
                System.out.println("Cliente conectado: " + socket.getInetAddress());

                BufferedReader in = new BufferedReader(
                        new InputStreamReader(socket.getInputStream()));
                PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

                String json = in.readLine();
                if (json == null) continue;
                System.out.println("Recebido: " + json);

                try {
                    JsonObject root = gson.fromJson(json, JsonObject.class);

                    // ======================================================================
                    // FIX 1: CAPTURAR "action": "buscarProgresso" (Vindo do HttpToTcpServer)
                    // ======================================================================
                    if (root != null && root.has("action") && "buscarProgresso".equalsIgnoreCase(root.get("action").getAsString())) {
                        String userId = root.get("userId").getAsString();
                        String response = obterProgresso(userId);
                        out.println(response);
                    }
                    // ---------- EVENTOS (tem campo "tipo") ----------
                    else if (root != null && root.has("tipo")) {
                        String response = processarEvento(root);
                        out.println(response);
                    } 
                    // ---------- CADASTRO ou LOGIN ----------
                    else {
                        Usuario usuario = gson.fromJson(json, Usuario.class);

                        if (isCadastro(usuario)) {
                            // CADASTRO
                            try {
                                String senhaHash = BCrypt.hashpw(usuario.getSenha(), BCrypt.gensalt());
                                salvarNoMongo(usuario, senhaHash);

                                out.println("{\"status\": \"ok\", \"mensagem\": \"Usuário cadastrado e salvo no MongoDB.\"}");
                                System.out.println("Cadastro OK: " + usuario);
                            } catch (MongoException me) {
                                me.printStackTrace();
                                out.println("{\"status\": \"erro\", \"mensagem\": \"Erro ao salvar no banco de dados.\"}");
                                System.out.println("Erro ao salvar no MongoDB: " + me.getMessage());
                            }

                        } else if (isLogin(usuario)) {
                            // LOGIN
                            try {
                                Document doc = usuariosCollection
                                        .find(Filters.eq("email", usuario.getEmail()))
                                        .first();

                                if (doc == null) {
                                    out.println("{\"status\":\"erro\",\"mensagem\":\"Usuário não encontrado.\"}");
                                    System.out.println("Login falhou: usuário não encontrado (" + usuario.getEmail() + ")");
                                } else {
                                    String senhaHash = doc.getString("senhaHash");

                                    if (senhaHash == null) {
                                        out.println("{\"status\":\"erro\",\"mensagem\":\"Usuário sem senha cadastrada.\"}");
                                        System.out.println("Login falhou: usuário sem senha hash (" + usuario.getEmail() + ")");
                                    } else if (BCrypt.checkpw(usuario.getSenha(), senhaHash)) {
                                        out.println("{\"status\":\"ok\",\"mensagem\":\"Login realizado com sucesso.\"}");
                                        System.out.println("Login OK para: " + usuario.getEmail());
                                    } else {
                                        out.println("{\"status\":\"erro\",\"mensagem\":\"Senha incorreta.\"}");
                                        System.out.println("Login falhou: senha incorreta para " + usuario.getEmail());
                                    }
                                }
                            } catch (MongoException me) {
                                me.printStackTrace();
                                out.println("{\"status\":\"erro\",\"mensagem\":\"Erro ao acessar o banco de dados.\"}");
                                System.out.println("Erro de Mongo no login: " + me.getMessage());
                            }

                        } else {
                            out.println("{\"status\": \"erro\", \"mensagem\": \"Campos obrigatórios ausentes ou inválidos.\"}");
                            System.out.println("Requisição inválida para cadastro/login: " + json);
                        }
                    }
                } catch (JsonSyntaxException e) {
                    out.println("{\"status\": \"erro\", \"mensagem\": \"JSON inválido.\"}");
                    System.out.println("Erro de sintaxe no JSON: " + e.getMessage());
                }

                System.out.println("Conexão encerrada.\n");

            } catch (IOException e) {
                if (running) {
                    e.printStackTrace();
                    System.out.println("Erro ao tratar cliente.");
                }
            }
        }

        if (mongoClient != null) mongoClient.close();
        System.out.println("Servidor parado.");
    }

    // ======================================================
    // =================== MÉTODO STOP ======================
    // ======================================================
    public void stop() throws IOException {
        running = false;
        if (serverSocket != null && !serverSocket.isClosed()) {
            serverSocket.close(); // força IOException no accept() → encerra loop
        }
    }

    // ======================================================
    // ==================== MAIN ORIGINAL ===================
    // ======================================================
    public static void main(String[] args) {
        try {
            MainServer server = new MainServer(5000);
            server.start();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // =================== HELPERS: cadastro vs login ===================

    private static boolean isCadastro(Usuario u) {
        return u != null &&
                u.getNome() != null && !u.getNome().isBlank() &&
                u.getEmail() != null && !u.getEmail().isBlank() &&
                u.getSenha() != null && !u.getSenha().isBlank() &&
                u.getIdade() != null && u.getIdade() > 0;
    }

    private static boolean isLogin(Usuario u) {
        // Para login, esperamos só email + senha (sem nome/idade)
        return u != null &&
                u.getEmail() != null && !u.getEmail().isBlank() &&
                u.getSenha() != null && !u.getSenha().isBlank() &&
                (u.getNome() == null || u.getNome().isBlank()) &&
                u.getIdade() == null;
    }

    // ======================================================
    // =================== MONGO + DOTENV ===================
    // ======================================================

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

        String historicoName = dotenv.get("MONGO_COLLECTION_HISTORICO");
        if (historicoName == null || historicoName.isEmpty()) {
            historicoName = "historico_missoes";
            System.out.println("MONGO_COLLECTION_HISTORICO não definido. Usando padrão: " + historicoName);
        }

        String narrativaName = dotenv.get("MONGO_COLLECTION_NARRATIVA");
        if (narrativaName == null || narrativaName.isEmpty()) {
            narrativaName = "estado_narrativa";
            System.out.println("MONGO_COLLECTION_NARRATIVA não definido. Usando padrão: " + narrativaName);
        }

        mongoClient = MongoClients.create(uri);
        MongoDatabase db = mongoClient.getDatabase(dbName);
        usuariosCollection = db.getCollection(collectionName);
        historicoMissoesCollection = db.getCollection(historicoName);
        estadoNarrativaCollection = db.getCollection(narrativaName);

        System.out.println("Conectado ao MongoDB.");
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

    // ---------------------- EVENTOS ----------------------

    private static String processarEvento(JsonObject root) {
        String tipo = root.get("tipo").getAsString();
        String idUsuario = root.has("id_usuario") ? root.get("id_usuario").getAsString() : null;
        String idMissao = root.has("id_missao") ? root.get("id_missao").getAsString() : "M01_INTRO";

        if (idUsuario == null || idUsuario.isEmpty()) {
            return "{\"status\":\"erro\",\"mensagem\":\"id_usuario é obrigatório\"}";
        }

        if ("dialogo".equalsIgnoreCase(tipo)) {
            registrarDialogo(idUsuario, root);
            return "{\"status\":\"ok\",\"mensagem\":\"Diálogo registrado.\"}";
        }

        if ("progresso_get".equalsIgnoreCase(tipo)) {
            return obterProgresso(idUsuario);
        }

        if ("tentativa".equalsIgnoreCase(tipo)) {
            return registrarTentativa(idUsuario, idMissao, root);
        }

        return "{\"status\":\"erro\",\"mensagem\":\"tipo desconhecido\"}";
    }

    private static void registrarDialogo(String idUsuario, JsonObject root) {
        String texto = root.has("texto") ? root.get("texto").getAsString() : "";
        String persona = root.has("persona") ? root.get("persona").getAsString() : "narrador";
        long timestamp = System.currentTimeMillis();

        Dialogo dialogo = new Dialogo(texto, persona, timestamp);

        Document filtro = new Document("id_usuario", idUsuario);
        Document pushDoc = new Document("texto", dialogo.getTexto())
                .append("persona", dialogo.getPersona())
                .append("timestamp", dialogo.getTimestamp());

        Document update = new Document("$set", new Document("id_usuario", idUsuario))
                .append("$push", new Document("dialogos_vistos", pushDoc));

        estadoNarrativaCollection.updateOne(filtro, update, new com.mongodb.client.model.UpdateOptions().upsert(true));
    }

    private static String registrarTentativa(String idUsuario, String idMissao, JsonObject root) {
        HistoricoMissao hm = new HistoricoMissao();
        hm.setIdUsuario(idUsuario);
        hm.setIdMissao(idMissao);
        String codigo = root.has("codigo_submetido") ? root.get("codigo_submetido").getAsString() : "";
        String erro = root.has("erro") ? root.get("erro").getAsString() : "";
        hm.setCodigoSubmetido(codigo);
        hm.setErro(erro);
        hm.setData(new Date());

        List<String> outputList = new ArrayList<>();
        if (root.has("output") && root.get("output").isJsonArray()) {
            JsonArray arr = root.getAsJsonArray("output");
            for (JsonElement e : arr) {
                outputList.add(e.getAsString());
            }
        }
        hm.setOutput(outputList);

        String resultado = validarMissao(idMissao, codigo, erro);
        hm.setResultado(resultado);

        Document tentativa = new Document("id_usuario", hm.getIdUsuario())
                .append("id_missao", hm.getIdMissao())
                .append("resultado", hm.getResultado())
                .append("data", hm.getData())
                .append("codigo_submetido", hm.getCodigoSubmetido());

        if (!hm.getOutput().isEmpty()) {
            tentativa.append("output", hm.getOutput());
        }
        if (hm.getErro() != null && !hm.getErro().isEmpty()) {
            tentativa.append("erro", hm.getErro());
        }

        historicoMissoesCollection.insertOne(tentativa);
        atualizarNarrativaPosTentativa(idUsuario, idMissao, resultado);

        String feedback = resultado.equals("SUCESSO")
                ? "Missão " + idMissao + " concluída."
                : "Missão " + idMissao + " ainda não passou.";

        return "{\"status\":\"ok\",\"resultado\":\"" + resultado + "\",\"feedback\":\"" + feedback + "\"}";
    }

    private static void atualizarNarrativaPosTentativa(String idUsuario, String idMissao, String resultado) {
        Document filtro = new Document("id_usuario", idUsuario);
        Document set = new Document("ultima_missao", idMissao)
                .append("ultima_atualizacao", new java.util.Date());

        if ("SUCESSO".equals(resultado)) {
            set.append("ponto_historia_atual", idMissao + "_COMPLETA");
            String proxima = proximaMissao(idMissao);
            if (proxima != null) {
                set.append("missao_atual", proxima);
                set.append("status_missao", "EM_ANDAMENTO");
            } else {
                set.append("missao_atual", idMissao);
                set.append("status_missao", "CONCLUIDA");
                set.append("modulo_status", "CONCLUIDO");
            }
        }

        Document update = new Document("$set", set);
        estadoNarrativaCollection.updateOne(filtro, update, new com.mongodb.client.model.UpdateOptions().upsert(true));
    }

    private static String validarMissao(String idMissao, String codigo, String erro) {
        if (erro != null && !erro.isEmpty()) {
            return "FALHA";
        }

        if (idMissao.startsWith("M01")) {
            boolean hasPrint = codigo.contains("print");
            boolean hasString = codigo.contains("\"") || codigo.contains("'");
            return (hasPrint && hasString) ? "SUCESSO" : "FALHA";
        }

        if (idMissao.startsWith("M02")) {
            boolean hasAssign = codigo.matches("(?s).*\\b[A-Za-z_]\\w*\\s*=\\s*.+");
            boolean hasPrintVar = codigo.matches("(?s).*print\\s*\\(\\s*[A-Za-z_]\\w*\\s*\\).*");
            return (hasAssign && hasPrintVar) ? "SUCESSO" : "FALHA";
        }

        if (idMissao.startsWith("M03")) {
            boolean hasInput = codigo.contains("input(");
            boolean hasConvert = codigo.contains("int(") || codigo.contains("float(") || codigo.contains("str(");
            boolean printsResult = codigo.contains("print");
            return (hasInput && hasConvert && printsResult) ? "SUCESSO" : "FALHA";
        }

        if (idMissao.startsWith("M04")) {
            boolean hasOperator = codigo.contains("+") || codigo.contains("-") || codigo.contains("*") || codigo.contains("/");
            boolean printsResult = codigo.contains("print");
            boolean avoidsOnlyString = !(codigo.contains("\"\"\"") || codigo.contains("'''"));
            return (hasOperator && printsResult && avoidsOnlyString) ? "SUCESSO" : "FALHA";
        }

        return "PENDENTE";
    }

    private static String proximaMissao(String atual) {
        for (int i = 0; i < MISSION_SEQUENCE.length; i++) {
            if (MISSION_SEQUENCE[i].equals(atual) && i + 1 < MISSION_SEQUENCE.length) {
                return MISSION_SEQUENCE[i + 1];
            }
        }
        return null;
    }

    // ======================================================================
    // FIX 2: OBTER PROGRESSO COM HISTÓRICO DE DIÁLOGOS
    // ======================================================================
    private static String obterProgresso(String idUsuario) {
        Document filtro = new Document("id_usuario", idUsuario);
        Document narrativa = estadoNarrativaCollection.find(filtro).first();

        Document lastTentativa = historicoMissoesCollection.find(filtro)
                .sort(Sorts.descending("data"))
                .first();

        JsonObject resp = new JsonObject();
        resp.addProperty("status", "ok");
        resp.addProperty("id_usuario", idUsuario);

        if (narrativa != null) {
            if (narrativa.get("ponto_historia_atual") != null)
                resp.addProperty("ponto_historia_atual", narrativa.getString("ponto_historia_atual"));
            if (narrativa.get("ultima_missao") != null)
                resp.addProperty("ultima_missao", narrativa.getString("ultima_missao"));
            if (narrativa.get("missao_atual") != null)
                resp.addProperty("missao_atual", narrativa.getString("missao_atual"));
            if (narrativa.get("status_missao") != null)
                resp.addProperty("status_missao", narrativa.getString("status_missao"));
            if (narrativa.get("modulo_status") != null)
                resp.addProperty("modulo_status", narrativa.getString("modulo_status"));
            resp.addProperty("ultima_atualizacao",
                    narrativa.get("ultima_atualizacao") != null ? narrativa.get("ultima_atualizacao").toString() : null);

            // ----- AQUI ESTÁ A CORREÇÃO -----
            // Recupera o array de dialogos_vistos para o frontend restaurar o chat
            if (narrativa.containsKey("dialogos_vistos")) {
                List<Document> dialogosDocs = (List<Document>) narrativa.get("dialogos_vistos");
                JsonArray dialogosJson = new JsonArray();
                for (Document d : dialogosDocs) {
                    JsonObject dio = new JsonObject();
                    dio.addProperty("texto", d.getString("texto"));
                    dio.addProperty("persona", d.getString("persona"));
                    dio.addProperty("timestamp", d.getLong("timestamp"));
                    dialogosJson.add(dio);
                }
                resp.add("historico_dialogos", dialogosJson);
            }
            // --------------------------------
        }

        if (lastTentativa != null) {
            resp.addProperty("ultima_tentativa_missao", lastTentativa.getString("id_missao"));
            resp.addProperty("ultima_tentativa_resultado", lastTentativa.getString("resultado"));
            resp.addProperty("ultima_tentativa_data",
                    lastTentativa.get("data") != null ? lastTentativa.get("data").toString() : null);
        }

        return resp.toString();
    }

    // Os métodos handleClient, salvarProgresso, buscarProgresso e handleRequest
    // que existiam antes estão aqui para manter compatibilidade, caso algo ainda use
    // (embora a lógica principal já esteja no loop do start)

    private void handleClient(Socket socket) {
        try (
                BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
        ) {
            String json = in.readLine();
            System.out.println("Recebido: " + json);

            Gson gson = new Gson();

            try {
                JsonObject root = gson.fromJson(json, JsonObject.class);
                if (root != null && root.has("tipo")) {
                    String response = processarEvento(root);
                    out.println(response);
                } else {
                    Usuario usuario = gson.fromJson(json, Usuario.class);

                    if (usuario != null &&
                            usuario.getNome() != null &&
                            usuario.getEmail() != null) {

                        if (usuariosCollection != null) {
                            String senhaHash = BCrypt.hashpw(usuario.getSenha(), BCrypt.gensalt());
                            salvarNoMongo(usuario, senhaHash);
                            out.println("{\"status\": \"ok\", \"mensagem\": \"JSON válido e salvo no MongoDB.\"}");
                        } else {
                            out.println("{\"status\": \"ok\", \"mensagem\": \"JSON válido (modo teste - não persistido).\"}");
                        }
                    } else {
                        out.println("{\"status\": \"erro\", \"mensagem\": \"Campos obrigatórios ausentes.\"}");
                    }
                }
            } catch (JsonSyntaxException e) {
                out.println("{\"status\": \"erro\", \"mensagem\": \"JSON inválido.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                socket.close();
            } catch (IOException ignored) {}
        }

        System.out.println("Conexão encerrada.\n");
    }

    private void salvarProgresso(String userId, String missionId, String stage, String status) {
        try {
            Document progresso = new Document("userId", userId)
                    .append("missionId", missionId)
                    .append("stage", stage)
                    .append("status", status)
                    .append("updatedAt", new Date());

            historicoMissoesCollection.insertOne(progresso);
            System.out.println("Progresso salvo com sucesso para o usuário: " + userId);
        } catch (MongoException e) {
            System.err.println("Erro ao salvar progresso: " + e.getMessage());
        }
    }

    private String buscarProgresso(String userId) {
        try {
            Document progresso = historicoMissoesCollection.find(Filters.eq("userId", userId))
                    .sort(Sorts.descending("updatedAt"))
                    .first();

            if (progresso != null) {
                return progresso.toJson();
            } else {
                return "{}";
            }
        } catch (MongoException e) {
            System.err.println("Erro ao buscar progresso: " + e.getMessage());
            return "{\"error\": \"Erro ao buscar progresso\"}";
        }
    }

    private void handleRequest(String requestJson) {
        try {
            Gson gson = new Gson();
            JsonObject request = gson.fromJson(requestJson, JsonObject.class);

            String action = request.get("action").getAsString();
            if ("salvarProgresso".equals(action)) {
                String userId = request.get("userId").getAsString();
                String missionId = request.get("missionId").getAsString();
                String stage = request.get("stage").getAsString();
                String status = request.get("status").getAsString();

                salvarProgresso(userId, missionId, stage, status);
            } else if ("buscarProgresso".equals(action)) {
                String userId = request.get("userId").getAsString();
                String progresso = buscarProgresso(userId);
                System.out.println("Progresso encontrado: " + progresso);
            } else {
                System.out.println("Ação desconhecida: " + action);
            }
        } catch (JsonSyntaxException | NullPointerException e) {
            System.err.println("Erro ao processar requisição: " + e.getMessage());
        }
    }
}