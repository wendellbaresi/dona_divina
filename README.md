# 🍔 Churrasquinho da Dona Divina - Sistema de Gestão & PDV

<p align="center">
  <b>Sistema SPA (Single Page Application) de alta performance integrado ao Google Sheets para controle financeiro, PDV de balcão, comandas de clientes, impressão térmica para cozinha e despesas fixas.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google-drive&logoColor=white" alt="Google Apps Script">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white" alt="Google Sheets">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git">
</p>

---

## 📋 Sobre o Projeto

O **Churrasquinho da Dona Divina** foi desenvolvido para otimizar a operação de atendimento e gestão financeira de um comércio alimentício. O sistema conta com:
* **PDV Inteligente**: Catálogo modular de produtos com preços dinâmicos (Simples/Dupla), controle de carrinho e botão opcional de envio para impressão na cozinha.
* **Gestão de Comandas**: Acompanhamento de clientes em aberto (com soft delete), adição de novos itens sob demanda e quitação com lançamento automático no caixa.
* **Contas da Loja & Saídas**: Separação clara entre despesas fixas mensais (água, luz, aluguel) e despesas avulsas.
* **Performance Otimizada**: Dupla camada de cache (Server-side via `ScriptCache` + Memory Cache no Browser) para navegação instantânea.
* **Segurança**: Controle de acesso por lista VIP de administradores e bloqueio por inatividade de sessão (30 minutos).

---

## 📂 Estrutura do Repositório

```text
churrasquinho-dona-divina/
│
├── .clasp.json          # Configuração de vínculo com o projeto Apps Script
├── .gitignore           # Arquivos ignorados pelo Git
├── README.md            # Documentação do projeto
│
├── backend/             # Código do Servidor (Google Apps Script)
│   ├── Code.gs          # Rotinas principais, doGet, rotas API e Cache
│   ├── Config.gs        # Configurações globais, e-mails VIP e nomes de abas
│   ├── FinanceiroRepository.gs # Conexão e manipulação do Google Sheets
│   └── FinanceService.gs      # Regras de negócio e métricas do dashboard
│
└── frontend/            # Código da Interface (SPA)
    ├── Index.html       # Estrutura principal, modais globais e sidebar
    ├── Styles.html      # Estilos CSS globais e responsivos
    ├── Script.html      # Lógica client-side, controladores e roteamento
    │
    └── views/           # Views modulares injetadas dinamicamente
        ├── ProdutosView.html
        ├── ClientesView.html
        ├── EntradasView.html
        ├── SaidasView.html
        ├── ContasView.html
        └── DashboardView.html