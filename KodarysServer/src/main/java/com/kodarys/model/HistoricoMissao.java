package com.kodarys.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.google.gson.annotations.SerializedName;

/**
 * Model simples para representar uma tentativa (registro no historico_missoes).
 * Utiliza SerializedName para mapear nomes em snake_case do JSON recebido.
 */
public class HistoricoMissao {
    @SerializedName("id_usuario")
    private String idUsuario;

    @SerializedName("id_missao")
    private String idMissao;

    private String resultado;

    private Date data;

    @SerializedName("codigo_submetido")
    private String codigoSubmetido;

    private List<String> output = new ArrayList<>();

    private String erro;

    public HistoricoMissao() {}

    public String getIdUsuario() { return idUsuario; }
    public void setIdUsuario(String idUsuario) { this.idUsuario = idUsuario; }

    public String getIdMissao() { return idMissao; }
    public void setIdMissao(String idMissao) { this.idMissao = idMissao; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public Date getData() { return data; }
    public void setData(Date data) { this.data = data; }

    public String getCodigoSubmetido() { return codigoSubmetido; }
    public void setCodigoSubmetido(String codigoSubmetido) { this.codigoSubmetido = codigoSubmetido; }

    public List<String> getOutput() { return output; }
    public void setOutput(List<String> output) { this.output = output; }

    public String getErro() { return erro; }
    public void setErro(String erro) { this.erro = erro; }

    @Override
    public String toString() {
        return "HistoricoMissao{" +
                "idUsuario='" + idUsuario + '\'' +
                ", idMissao='" + idMissao + '\'' +
                ", resultado='" + resultado + '\'' +
                ", data=" + data +
                ", codigoSubmetido='" + codigoSubmetido + '\'' +
                ", output=" + output +
                ", erro='" + erro + '\'' +
                '}';
    }
}
