/* ======= TEMA PADRÃO (DARK NEON BLUE) ======= */
body {
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(160deg, #0A0F1A, #101B2D);
  color: #E3F2FD;
  margin: 0;
  padding: 0;
  transition: background 0.5s ease-in-out, color 0.3s ease-in-out;
}

/* ======= MODO CLARO ======= */
body.light-mode {
  background: linear-gradient(160deg, #FFFFFF, #E6F2FF);
  color: #0A0F1A;
}

/* ======= HEADER FIXO ======= */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 15px 25px;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(66, 165, 245, 0.3);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 999;
  box-shadow: 0 2px 15px rgba(66, 165, 245, 0.2);
  transition: background 0.4s ease, color 0.3s ease;
}

body.light-mode header {
  background: rgba(245, 249, 255, 0.85);
  border-bottom: 1px solid rgba(21, 101, 192, 0.2);
  box-shadow: 0 2px 15px rgba(21, 101, 192, 0.15);
}

header h1 {
  margin: 5px 0;
  font-size: 1.5em;
  color: #42A5F5;
  text-shadow: 0 0 10px rgba(66, 165, 245, 0.5);
}

.logo {
  width: 90px;
  margin-bottom: 4px;
  filter: drop-shadow(0 0 6px #42A5F5);
  transition: 0.3s;
}

.logo:hover {
  transform: scale(1.05);
}

/* ======= BOTÃO DE TEMA ======= */
#themeToggle {
  position: absolute;
  top: 15px;
  right: 20px;
  background: linear-gradient(90deg, #42A5F5, #1565C0);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 20px;
  padding: 8px 14px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(66, 165, 245, 0.4);
  transition: 0.3s;
}

#themeToggle:hover {
  background: linear-gradient(90deg, #64B5F6, #1976D2);
  box-shadow: 0 0 15px rgba(66, 165, 245, 0.7);
}

body.light-mode #themeToggle {
  background: linear-gradient(90deg, #1565C0, #42A5F5);
  color: white;
}

/* ======= ESPAÇO PARA HEADER FIXO ======= */
main {
  margin-top: 160px;
}

/* ======= CARDS ======= */
.card {
  background: rgba(30, 41, 59, 0.9);
  padding: 20px;
  border-radius: 14px;
  margin: 25px auto;
  max-width: 900px;
  box-shadow: 0 4px 25px rgba(66, 165, 245, 0.25);
  backdrop-filter: blur(8px);
  transition: transform 0.2s, box-shadow 0.3s, background 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 30px rgba(66, 165, 245, 0.35);
}

body.light-mode .card {
  background: rgba(255, 255, 255, 0.95);
  color: #0A0F1A;
  border: 1px solid #90CAF9;
  box-shadow: 0 2px 12px rgba(21, 101, 192, 0.15);
}

/* ======= CAMPOS ======= */
input, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #42A5F5;
  border-radius: 10px;
  background-color: #0A0F1A;
  color: #E3F2FD;
  margin-top: 6px;
  transition: border 0.3s, box-shadow 0.3s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #90CAF9;
  box-shadow: 0 0 8px rgba(66, 165, 245, 0.6);
}

body.light-mode input, 
body.light-mode textarea {
  background: #F8FAFF;
  border-color: #64B5F6;
  color: #0A0F1A;
}

textarea {
  height: 90px;
}

/* ======= BOTÕES ======= */
button {
  margin-top: 10px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #42A5F5, #1565C0);
  color: #0A0F1A;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s ease;
  box-shadow: 0 0 10px rgba(66, 165, 245, 0.3);
}

button:hover {
  background: linear-gradient(90deg, #64B5F6, #1976D2);
  color: white;
  box-shadow: 0 0 15px rgba(66, 165, 245, 0.6);
}

.btn-cancelar, .btn-resetar {
  background: linear-gradient(90deg, #D32F2F, #9A0007);
  color: white;
}

.btn-cancelar:hover, .btn-resetar:hover {
  background: linear-gradient(90deg, #EF5350, #C62828);
  box-shadow: 0 0 12px rgba(239, 83, 80, 0.6);
}

/* ======= EVENTO CARD ======= */
.evento-card {
  background: rgba(10, 15, 26, 0.9);
  border: 1px solid #42A5F5;
  border-radius: 12px;
  padding: 12px;
  margin-top: 15px;
  box-shadow: 0 0 15px rgba(66, 165, 245, 0.2);
  transition: 0.3s;
}

.evento-card:hover {
  box-shadow: 0 0 25px rgba(66, 165, 245, 0.35);
  transform: translateY(-2px);
}

body.light-mode .evento-card {
  background: rgba(230, 244, 255, 0.9);
  border-color: #64B5F6;
}

/* ======= VIRADA DE LOTE ======= */
.info-virada {
  color: #FF5252;
  font-weight: bold;
  margin-top: 6px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.alerta-virada {
  animation: piscar 1s infinite alternate;
}

@keyframes piscar {
  0% {
    color: #FF5252;
    transform: scale(1);
    text-shadow: 0 0 6px rgba(255, 82, 82, 0.8);
  }
  100% {
    color: #FF0000;
    transform: scale(1.08);
    text-shadow: 0 0 12px rgba(255, 0, 0, 0.9);
  }
}

/* ======= BOTÃO CHECKLIST ======= */
.btn-check {
  background: linear-gradient(90deg, #4CAF50, #2E7D32);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  padding: 6px 10px;
  margin-left: 10px;
  transition: 0.3s;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.4);
}

.btn-check:hover {
  background: linear-gradient(90deg, #66BB6A, #43A047);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.6);
}

/* ======= LOTE ATUALIZADO ======= */
.lote-ok {
  color: #4CAF50;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}

/* ======= FOOTER ======= */
footer {
  text-align: center;
  padding: 15px;
  background: #0A0F1A;
  border-top: 2px solid #42A5F5;
  color: #90CAF9;
  margin-top: 40px;
  font-size: 14px;
  letter-spacing: 0.5px;
}

body.light-mode footer {
  background: #E3F2FD;
  color: #0A0F1A;
  border-top: 2px solid #64B5F6;
}
