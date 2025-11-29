package com.kodarys.model;

import com.google.gson.Gson;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class NarrativaModelTest {

    @Test
    public void parseNarrativaFromJson() {
        String json = "{"
                + "\"idUsuario\":\"u1\","
                + "\"pontoHistoriaAtual\":\"M01_INTRO_COMPLETA\","
                + "\"ultimaMissao\":\"M01_INTRO\","
                + "\"missaoAtual\":\"M02_VARIAVEIS\","
                + "\"statusMissao\":\"EM_ANDAMENTO\","
                + "\"moduloStatus\":\"MODULE1\","
                + "\"dialogosVistos\":["
                + "  {\"texto\":\"Olá\",\"persona\":\"narrador\",\"timestamp\":1600000000000},"
                + "  {\"texto\":\"Bem-vindo\",\"persona\":\"mentor\",\"timestamp\":1600000001000}"
                + "]"
                + "}";
        Gson gson = new Gson();
        Narrativa n = gson.fromJson(json, Narrativa.class);
        assertNotNull(n);
        assertEquals("u1", n.getIdUsuario());
        assertEquals("M01_INTRO_COMPLETA", n.getPontoHistoriaAtual());
        assertEquals("M02_VARIAVEIS", n.getMissaoAtual());
        assertNotNull(n.getDialogosVistos());
        assertEquals(2, n.getDialogosVistos().size());
        assertEquals("Olá", n.getDialogosVistos().get(0).getTexto());
    }
}
