# Sistema de Clínicas Médicas

Este é um sistema completo para clínicas médicas, construído do zero com Vue.js para o frontend e Node.js para o backend. O sistema permite o cadastro de usuários, agendamento de consultas e oferece um painel administrativo para gerenciamento.

## Funcionalidades

- **Cadastro e Login Seguro**: Sistema de autenticação com hash de senha e tokens JWT.
- **Agendamento de Consultas**: Interface com calendário interativo para agendamento de consultas, com validação de horários duplicados.
- **Painel Administrativo**: Acesso restrito para gerenciar, editar e excluir agendamentos.
- **Autocompletar Endereço**: Consulta automática de endereço pelo CEP usando a API ViaCEP.
- **Previsão do Tempo**: Integração com a API do OpenWeatherMap para informar a previsão do tempo no dia da consulta.

## Tecnologias Utilizadas

### Frontend
- **Vue.js**: Framework JavaScript para construção da interface de usuário.
- **Vue Router**: Para gerenciar a navegação entre as páginas.
- **Axios**: Cliente HTTP para fazer requisições para o backend.
- **v-calendar**: Biblioteca para o componente de calendário.

### Backend
- **Node.js**: Ambiente de execução para o servidor.
- **Express.js**: Framework web para as rotas da API.
- **pg**: Driver para a conexão com o banco de dados PostgreSQL.
- **bcrypt.js**: Para criptografar as senhas de forma segura.
- **jsonwebtoken (JWT)**: Para criar tokens de autenticação.
- **axios**: Para fazer requisições da API de clima a partir do servidor.

### Banco de Dados
- **PostgreSQL**: Banco de dados relacional para armazenar os dados da aplicação.

## Como Rodar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- PostgreSQL
- Uma chave de API do OpenWeatherMap

### Configuração do Banco de Dados
1. Certifique-se de que o seu servidor PostgreSQL está rodando.
2. Crie um banco de dados com o nome `clinica_db`.
3. Crie um usuário para a aplicação e conceda as permissões necessárias. Execute os seguintes comandos no Query Tool do pgAdmin, um por um:

`
CREATE USER clinica_admin WITH PASSWORD 'sua-senha-muito-forte';
GRANT ALL PRIVILEGES ON DATABASE clinica_db TO clinica_admin;`

### Crie as tabelas users e appointments

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Agendado',
  user_id INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

### Conceda as permissões de uso nas tabelas e sequências ao seu novo usuário

GRANT ALL PRIVILEGES ON TABLE users TO clinica_admin;
GRANT ALL PRIVILEGES ON TABLE appointments TO clinica_admin;
GRANT USAGE ON SEQUENCE users_id_seq TO clinica_admin;
GRANT USAGE ON SEQUENCE appointments_id_seq TO clinica_admin;

### Crie um arquivo .env na pasta backend com a string de conexão e as chaves de API

PORT=3000
DATABASE_URL="postgresql://clinica_admin:sua-senha-muito-forte@localhost:5432/clinica_db"
JWT_SECRET="sua-chave-secreta-do-jwt"
WEATHER_API_KEY="sua-chave-de-api-do-clima"

### Rodando o Servidor (Backend)

Na pasta backend, instale as dependências e inicie o servidor:

npm install
node server.js

### Rodando a Aplicação (Frontend)

Na pasta frontend, instale as dependências e inicie a aplicação:

npm install
npm run dev

A aplicação estará disponível em http://localhost:5173.

Links de Deploy
Frontend: [Link para o deploy do frontend]

Backend: [Link para o deploy do backend]