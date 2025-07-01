# Desafio Técnico - LogAp Sistemas 2025

Este projeto é a solução desenvolvida para o Desafio Técnico de Desenvolvedor de Software Júnior da LogAp Sistemas. A aplicação consiste em um sistema de gestão de vendas (Tarefa 2) com um backend em Python (Flask) e um frontend em React, que também incorpora uma API específica de análise de string (Tarefa 1).

## Estrutura do Projeto

O projeto está organizado em duas pastas principais na raiz do repositório:
- `backend/`: Contém todo o código da API RESTful desenvolvida em Python (Flask).
- `frontend/`: Contém todo o código da aplicação web desenvolvida em React.

## Tecnologias Utilizadas

**Backend:**
- **Python 3.x**: Linguagem de programação.
- **Flask**: Microframework web para construção da API RESTful.
- **Flask-SQLAlchemy**: ORM (Object-Relational Mapper) para interação com o banco de dados.
- **SQLite**: Banco de dados embutido utilizado para persistência dos dados (arquivo `database.db` em `backend/instance/`).
- **Flask-CORS**: Extensão para gerenciar políticas de Cross-Origin Resource Sharing (CORS), permitindo a comunicação entre o frontend React e o backend Flask.

**Frontend:**
- **React**: Biblioteca JavaScript para construção de interfaces de usuário dinâmicas.
- **Create React App**: Ferramenta oficial para configurar um ambiente de desenvolvimento React.
- **JavaScript (ES6+)**: Linguagem de programação.
- **HTML5/CSS3**: Para a estrutura e estilização da interface.
- **React Router DOM**: Biblioteca para gerenciamento de rotas e navegação na aplicação Single Page Application (SPA).
- **Node.js e npm**: Ambiente de execução JavaScript e gerenciador de pacotes para o desenvolvimento frontend.

**Ferramentas e Conceitos:**
- **APIs RESTful**: Padrão de comunicação entre frontend e backend.
- **Git**: Sistema de controle de versão.
- **Ambientes Virtuais Python (`venv`)**: Para isolamento de dependências.
- **Gerenciamento de Pacotes (`pip`, `npm`)**.

## Funcionalidades Implementadas

### Tarefa 1: API de Análise de String

Uma API RESTful que processa uma string com uma lógica específica:
-   **Endpoint:** `POST /api/analisar-string`
-   **Funcionalidade:** Recebe uma string via requisição HTTP e encontra o primeiro caractere vogal que atende aos seguintes critérios:
    1.  Está localizado após uma consoante.
    2.  Essa mesma consoante é antecessora a uma vogal.
    3.  A vogal encontrada não se repete em nenhuma outra parte da string (considerando maiúsculas e minúsculas).
-   **Premissas:** A lógica de identificação da vogal foi implementada com uma única passagem lógica (utilizando uma máquina de estados e contagem prévia de caracteres para a condição de não repetição), sem o uso de bibliotecas externas para a identificação da vogal, conforme requisitado.
-   **Exemplo:**
    -   **Entrada:** `aAbBABacafe`
    -   **Saída Esperada:** `e`
-   **Formato de Resposta (JSON):**
    ```json
    {
      "string": "aAbBABacafe",
      "vogal": "e",
      "tempoTotal": "10ms"
    }
    ```

### Tarefa 2: Aplicação Web de Gestão de Vendas

Uma ferramenta completa para vendedores e administradores gerenciarem e acompanharem pedidos de forma eficiente.

**Módulos e Funcionalidades:**

-   **Gerenciamento de Clientes:**
    -   Cadastro de novos clientes (nome, e-mail).
    -   Listagem de todos os clientes cadastrados.
    -   Edição de informações de clientes existentes.
    -   Exclusão de clientes (com validação para impedir a exclusão se houver pedidos associados e deleção em cascata se não houver).
-   **Gerenciamento de Produtos:**
    -   Cadastro de novos produtos (nome, preço).
    -   Listagem de todos os produtos disponíveis.
    -   Edição de informações de produtos existentes.
    -   Exclusão de produtos (com validação para impedir a exclusão se houver itens de pedido associados).
-   **Gerenciamento de Pedidos:**
    -   Cadastro de novos pedidos, associando a um cliente existente e adicionando múltiplos produtos com suas respectivas quantidades.
    -   Listagem detalhada de todos os pedidos, incluindo cliente, status, valor total e itens do pedido.
    -   Acompanhamento e edição do status dos pedidos (e.g., "Em andamento", "Finalizado", "Cancelado").
    -   Exclusão de pedidos (com deleção em cascata dos itens do pedido).
-   **Relatórios de Vendas:**
    -   **Resumo das Vendas:** Exibe o total de pedidos realizados, o valor total faturado e a quantidade total de produtos vendidos.
    -   **Pedidos Pendentes:** Lista todos os pedidos que ainda estão com o status "Em andamento".
    -   **Clientes Mais Ativos:** Apresenta uma lista dos clientes que mais realizaram pedidos, ordenados decrescentemente.

## Deploy na Nuvem (Instruções de Acesso) - Rodar a Aplicação online

A aplicação está hospedada na nuvem para facilitar a avaliação.

-   **URL da Aplicação Online:**
  `https://logap-desafio-dev-junior-murilo-silva-1ekp.onrender.com/` 

-   **Instruções de Uso:**
    1.  Acesse a URL da aplicação acima.
    2.  Navegue pelo menu superior para acessar as funcionalidades de Clientes, Produtos, Pedidos e Relatórios.
    3.  Dados de exemplo são criados automaticamente na primeira execução do backend para facilitar o teste.
    4.  A API da Tarefa 1 (Analisador de Vogal) pode ser testada na página correspondente.

## Como Rodar a Aplicação Localmente

Certifique-se de ter **Python 3.x** (preferencialmente 3.9+) e **Node.js com npm** (versão LTS) instalados no seu sistema.

### 1. Configurar e Iniciar o Backend (API Flask)

1.  Abra seu terminal/PowerShell.
2.  Navegue até a pasta `backend/` do projeto:
    ```bash
    cd [caminho_para_seu_projeto]/logap_challenge/backend
    ```
3.  Crie e ative o ambiente virtual Python:
    ```bash
    python -m venv venv
    .\venv\Scripts\Activate.ps1   # Para Windows PowerShell
    # source venv/bin/activate    # Para Linux/macOS ou Git Bash
    ```
4.  Instale as dependências Python:
    ```bash
    pip install -r requirements.txt
    ```
    *Se o `requirements.txt` não existir, gere-o primeiro com `pip freeze > requirements.txt` e depois execute `pip install -r requirements.txt`.*
5.  Inicie o servidor Flask:
    ```bash
    python app.py
    ```
    O backend estará acessível em `http://127.0.0.1:5000/`. Mantenha este terminal aberto e rodando.

### 2. Configurar e Iniciar o Frontend (Aplicação React)

1.  Abra um **NOVO** terminal/PowerShell (mantenha o do backend rodando).
2.  Navegue até a pasta `frontend/` do projeto:
    ```bash
    cd [caminho_para_seu_projeto]/logap_challenge/frontend
    ```
3.  Instale as dependências Node.js/npm (se ainda não o fez):
    ```bash
    npm install
    #npm install react-router-dom (se não estiver no package.json após npm install)
    ```
4.  Inicie o aplicativo React:
    ```bash
    npm start
    ```
    O frontend será aberto automaticamente no seu navegador em `http://localhost:3000/`. Mantenha este terminal aberto.


## Considerações e Desafios

-   **Lógica da Tarefa 1:** O desafio de não reiniciar o fluxo e a condição de "não se repete" foram abordados com uma única passagem lógica (máquina de estados) e uma pré-contagem de caracteres, respectivamente, para otimizar a performance e atender às premissas.
-   **Deleção de Clientes:** A complexidade da deleção em cascata (cliente -> pedidos -> itens de pedido) foi tratada no backend utilizando os recursos de relacionamento e cascade do SQLAlchemy, garantindo a integridade referencial do banco de dados.
-   **Validação de Inputs:** Validações básicas foram implementadas no backend para garantir a qualidade e o tipo correto dos dados (ex: e-mail único, preço numérico).
-   **UX/UI:** O foco principal da interface foi a funcionalidade e a usabilidade, com um design limpo e intuitivo para as operações de CRUD e visualização de relatórios. Melhorias visuais como a logo e o efeito de digitação foram adicionadas para aprimorar a experiência.

### Melhorias Futuras (Ideias para Evolução do Projeto)

-   **Geração de Relatórios em PDF:** Adicionar a funcionalidade de download dos relatórios (Resumo das Vendas, Pedidos Pendentes, Clientes Mais Ativos) em formato PDF, oferecendo uma opção de exportação mais profissional.
-   **Autenticação e Autorização de Usuários:** Implementar um sistema completo de login e controle de acesso baseado em papéis (RBAC) para diferentes tipos de usuários (vendedores, administradores).
-   **Dashboard Interativo:** Criar um dashboard na página inicial com gráficos e métricas chave de vendas para uma visão executiva.
-   **Testes Automatizados:** Escrever testes unitários e de integração para o backend e o frontend para garantir a estabilidade e qualidade do código.

## Contato

**Murilo Francisco da Silva /**
**murilodevweb@gmail.com /**
**https://www.linkedin.com/in/murilosilvaof/**
**/ 84 991415330**
