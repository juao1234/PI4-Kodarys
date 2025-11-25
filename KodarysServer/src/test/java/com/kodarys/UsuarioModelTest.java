package com.kodarys;

import com.google.gson.Gson;
import com.kodarys.model.Usuario;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários simples para o model Usuario (JSON -> objeto).
 * Serve para garantir compatibilidade de payloads enviados ao servidor.
 */
public class UsuarioModelTest {

    @Test
    public void parseFullJsonToUsuario() {
        String json = "{\"nome\":\"Raul\",\"idade\":21,\"email\":\"raul@teste.com\",\"senha\":\"abc123\"}";
        Gson gson = new Gson();
        Usuario u = gson.fromJson(json, Usuario.class);
        assertNotNull(u, "Usuario não deveria ser null após parse");
        assertEquals("Raul", u.getNome());
        assertEquals(21, u.getIdade());
        assertEquals("raul@teste.com", u.getEmail());
        assertEquals("abc123", u.getSenha());
    }

    @Test
    public void parseJsonMissingOptionalSenha() {
        String json = "{\"nome\":\"Joao\",\"idade\":30,\"email\":\"joao@x.com\"}";
        Gson gson = new Gson();
        Usuario u = gson.fromJson(json, Usuario.class);
        assertNotNull(u);
        assertEquals("Joao", u.getNome());
        assertEquals(30, u.getIdade());
        assertEquals("joao@x.com", u.getEmail());
        assertNull(u.getSenha(), "Senha deve ser null quando não enviada");
    }

    @Test
    public void parseJsonWithMissingFieldsProducesNulls() {
        String json = "{\"nome\":\"SóNome\"}";
        Gson gson = new Gson();
        Usuario u = gson.fromJson(json, Usuario.class);
        assertNotNull(u);
        assertEquals("SóNome", u.getNome());
        assertNull(u.getEmail());
        assertNull(u.getIdade());
    }
}
