# 🕷️ Spiders

![UX Refinado](https://img.shields.io/badge/UX-refinado-blueviolet.svg)
![Layout](https://img.shields.io/badge/Layout-responsivo-success)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow.svg)
![Feito%20com](https://img.shields.io/badge/feito%20com-Python%20%26%20Tailwind-blue)

Reconhecimento de superfície de ataque com backend em FastAPI e frontend refinado em TailwindCSS. Integra coleta, visualização e interação com experiência de usuário aprimorada.

---

## 📦 Requisitos

- Python 3.11+
- Docker + docker-compose
- Redis (incluso no docker-compose)
- PostgreSQL (via docker-compose)

---

## 🚀 Execução

```bash
docker-compose up -d --build
```

---

## 📁 Estrutura

- `spiders-backend/`: código principal do FastAPI
- `spiders-frontend/`: interface principal (index.html)
- `throttle.py`: sistema de delay progressivo via Redis (anti-brute-force)
- `auth.py`: endpoints protegidos com validação
- `README.md`: documentação geral

---

## 🧠 Melhorias de Experiência do Usuário (UX)

### ✔️ Alertas Inline Inteligentes
- Estilo visual com borda, cor e ícones
- Expiram automaticamente após 10s
- Desaparecem ao digitar ou clicar

### 🧪 Validações em Tempo Real
- Campos com bordas verdes/vermelhas
- Confirmação de senhas
- Campos obrigatórios com feedback imediato

### 🎨 Layout Unificado
- Título e subtítulo alinhados entre telas
- Espaçamento padronizado
- Sem deslocamentos ao mostrar alertas

---

## 🧰 Tecnologias

### Backend
- FastAPI + Uvicorn
- SQLAlchemy
- JWT com Python-Jose
- Redis
- Docker

### Frontend
- TailwindCSS
- HTML + JS Vanilla
- Lucide Icons

---

## 🧭 Roadmap / Backlog

- [ ] Módulo de reconhecimento por domínio (Amass)
- [ ] Enriquecimento de IP (ASN, CIDR, GeoIP)
- [ ] Visualização de relatórios `.json`
- [ ] Exportação para CSV/PDF
- [ ] Dashboard com autenticação
- [ ] Agendamento de varreduras
- [ ] Integração com Zabbix para envio de alertas

---

## 📄 Licença

MIT © [Nathan Mansberger](https://www.linkedin.com/in/nathanmansberger/)

