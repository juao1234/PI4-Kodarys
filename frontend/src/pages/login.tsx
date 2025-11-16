import React, { useState } from "react";
import "./login.css";
import UserIcon from '../assets/icons/User-icon.png';
import KeyIcon from '../assets/icons/Key-icon.png';
import EyeIcon from '../assets/icons/view.png';
import EyeClosedIcon from '../assets/icons/hide.png';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <h1 className="title">Kodarys</h1>
      <div className="login-card">
        <h3>Entre com a sua conta Kodarys</h3>
        <h4 className="aviso-retorno">A aventura aguarda o seu retorno</h4>

        <label className="label-form">Nome do usuário</label>
        <div className="input-box">
          <img src={UserIcon} alt="User icon" />
          <input placeholder="Digite seu nome" />
        </div>

        <label className="label-form">Senha</label>
        <div className="input-box">
          <img src={KeyIcon} alt="Key icon" />
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Digite sua senha" 
          />
          <img 
            src={showPassword ? EyeClosedIcon : EyeIcon}
            alt="Toggle password visibility"
            onClick={() => setShowPassword(!showPassword)}
            className="eye-icon"
          />
        </div>

        <button type="submit" className="button-adventure">Entrar na aventura</button>
        <h3>Novo por aqui?<span className="register-text"> Crie a sua conta</span></h3>
      </div>
    </div>
  );
}
