package com.kodarys.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Model simples para representar o estado da narrativa de um usuário.
 * Campos correspondem às chaves usadas no banco (estado_narrativa).
 */
public class Narrativa {
    private String idUsuario;
    private String pontoHistoriaAtual;
    private String ultimaMissao;
    private String missaoAtual;
    private String statusMissao;
    private String moduloStatus;
    private Object ultimaAtualizacao; // pode ser Date ou String, conforme leitura do DB
    private List<Dialogo> dialogosVistos = new ArrayList<>();

    public Narrativa() {}

    public String getIdUsuario() { return idUsuario; }
    public void setIdUsuario(String idUsuario) { this.idUsuario = idUsuario; }

    public String getPontoHistoriaAtual() { return pontoHistoriaAtual; }
    public void setPontoHistoriaAtual(String pontoHistoriaAtual) { this.pontoHistoriaAtual = pontoHistoriaAtual; }

    public String getUltimaMissao() { return ultimaMissao; }
    public void setUltimaMissao(String ultimaMissao) { this.ultimaMissao = ultimaMissao; }

    public String getMissaoAtual() { return missaoAtual; }
    public void setMissaoAtual(String missaoAtual) { this.missaoAtual = missaoAtual; }

    public String getStatusMissao() { return statusMissao; }
    public void setStatusMissao(String statusMissao) { this.statusMissao = statusMissao; }

    public String getModuloStatus() { return moduloStatus; }
    public void setModuloStatus(String moduloStatus) { this.moduloStatus = moduloStatus; }

    public Object getUltimaAtualizacao() { return ultimaAtualizacao; }
    public void setUltimaAtualizacao(Object ultimaAtualizacao) { this.ultimaAtualizacao = ultimaAtualizacao; }

    public List<Dialogo> getDialogosVistos() { return dialogosVistos; }
    public void setDialogosVistos(List<Dialogo> dialogosVistos) { this.dialogosVistos = dialogosVistos; }

    @Override
    public String toString() {
        return "Narrativa{" +
                "idUsuario='" + idUsuario + '\'' +
                ", pontoHistoriaAtual='" + pontoHistoriaAtual + '\'' +
                ", ultimaMissao='" + ultimaMissao + '\'' +
                ", missaoAtual='" + missaoAtual + '\'' +
                ", statusMissao='" + statusMissao + '\'' +
                ", moduloStatus='" + moduloStatus + '\'' +
                ", ultimaAtualizacao=" + ultimaAtualizacao +
                ", dialogosVistos=" + dialogosVistos +
                '}';
    }
}
