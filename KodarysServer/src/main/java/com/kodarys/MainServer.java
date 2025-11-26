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
                System.out.println("Recebido: " + json);

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

                            try {
                                String senhaHash = BCrypt.hashpw(usuario.getSenha(), BCrypt.gensalt());
                                salvarNoMongo(usuario, senhaHash);

                                out.println("{\"status\": \"ok\", \"mensagem\": \"JSON válido e salvo no MongoDB.\"}");
                                System.out.println("Usuário válido: " + usuario);
                            } catch (MongoException me) {
                                me.printStackTrace();
                                out.println("{\"status\": \"erro\", \"mensagem\": \"Erro ao salvar no banco de dados.\"}");
                                System.out.println("Erro ao salvar no MongoDB: " + me.getMessage());
                            }

                        } else {
                            out.println("{\"status\": \"erro\", \"mensagem\": \"Campos obrigatórios ausentes.\"}");
                            System.out.println("Usuário inválido (campos obrigatórios ausentes).");
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

    // ======================================================
    // =================== RESTANTE IGUAL ===================
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
        // Converte o conteúdo do diálogo em um objeto Dialogo
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
        // Constrói o model HistoricoMissao a partir do JsonObject
        HistoricoMissao hm = new HistoricoMissao();
        hm.setIdUsuario(idUsuario);
        hm.setIdMissao(idMissao);
        String codigo = root.has("codigo_submetido") ? root.get("codigo_submetido").getAsString() : "";
        String erro = root.has("erro") ? root.get("erro").getAsString() : "";
        hm.setCodigoSubmetido(codigo);
        hm.setErro(erro);
        hm.setData(new Date());

        // output (array)
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

        // Converte o model para Document manualmente (Opção A)
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

    private static java.util.List<String> jsonArrayToStringList(JsonElement element) {
        java.util.List<String> list = new java.util.ArrayList<>();
        if (element == null || !element.isJsonArray()) return list;
        JsonArray arr = element.getAsJsonArray();
        for (JsonElement e : arr) {
            list.add(e.getAsString());
        }
        return list;
    }

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
        }

        if (lastTentativa != null) {
            resp.addProperty("ultima_tentativa_missao", lastTentativa.getString("id_missao"));
            resp.addProperty("ultima_tentativa_resultado", lastTentativa.getString("resultado"));
            resp.addProperty("ultima_tentativa_data",
                    lastTentativa.get("data") != null ? lastTentativa.get("data").toString() : null);
        }

        return resp.toString();
    }
}
