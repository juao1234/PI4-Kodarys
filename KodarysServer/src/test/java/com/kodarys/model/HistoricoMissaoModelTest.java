package com.kodarys.model;

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class HistoricoMissaoModelTest {

    @Test
    public void parseHistoricoFromJson() {
        String json = "{"
                + "\"id_usuario\":\"u1\","
                + "\"id_missao\":\"M01_INTRO\","
                + "\"resultado\":\"SUCESSO\","
                + "\"data\":\"2023-01-01T00:00:00Z\","
                + "\"codigo_submetido\":\"print(\\\"ola\\\")\","
                + "\"output\":[\"ola\"],"
                + "\"erro\":\"\""
                + "}";
        Gson gson = new Gson();
        HistoricoMissao hm = gson.fromJson(json, HistoricoMissao.class);
        assertNotNull(hm);
        assertEquals("u1", hm.getIdUsuario());
        assertEquals("M01_INTRO", hm.getIdMissao());
        assertEquals("SUCESSO", hm.getResultado());
        assertEquals("print(\"ola\")", hm.getCodigoSubmetido());
        assertNotNull(hm.getOutput());
        assertEquals(1, hm.getOutput().size());
        assertEquals("ola", hm.getOutput().get(0));
    }
}
