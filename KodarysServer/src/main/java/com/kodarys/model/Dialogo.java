package com.kodarys.model;

/**
 * Model simples para um diálogo visto na narrativa.
 * Campos básicos: texto, persona e timestamp (epoch millis).
 */
public class Dialogo {
    private String texto;
    private String persona;
    private long timestamp;

    public Dialogo() {}

    public Dialogo(String texto, String persona, long timestamp) {
        this.texto = texto;
        this.persona = persona;
        this.timestamp = timestamp;
    }

    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }

    public String getPersona() { return persona; }
    public void setPersona(String persona) { this.persona = persona; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "Dialogo{" +
                "texto='" + texto + '\'' +
                ", persona='" + persona + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
