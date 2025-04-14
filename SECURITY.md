# 🔒 Política de Segurança

Agradecemos o seu interesse em ajudar a tornar o **Spiders** mais seguro. Levamos a segurança a sério e valorizamos qualquer contribuição responsável para manter nosso projeto livre de vulnerabilidades.

---

## 🧭 Como relatar uma vulnerabilidade

Se você encontrou uma vulnerabilidade no projeto, siga estas orientações:

1. **Não abra uma issue pública.**
2. Envie um e-mail diretamente para [nathan.mansberger@precisio.services](mailto:nathan.mansberger@precisio.services) com:
   - Descrição detalhada do problema
   - Etapas para reproduzir
   - Possível impacto
   - Recomendação (se possível)

---

## ✅ Boas práticas aplicadas no projeto

- Nenhum segredo ou variável sensível é commitado no código.
- Utilização de `.env` local, ignorado via `.gitignore`.
- Planejamento de `.env.example` para documentação de variáveis.
- Estrutura de autenticação com JWT e throttle por IP via Redis.
- Frontend validado com Tailwind e sem bibliotecas externas vulneráveis.

---

## 🔐 Recursos de segurança recomendados

Caso você deseje contribuir com segurança, recomendamos ativar as seguintes opções no GitHub (caso ainda não estejam habilitadas):

- **Dependabot Alerts**
- **Secret scanning**
- **Code scanning com CodeQL**

---

## 📄 Licença

Este projeto está sob a licença MIT. Ao contribuir com questões de segurança, você concorda com os termos de uso e boas práticas de divulgação responsável.

