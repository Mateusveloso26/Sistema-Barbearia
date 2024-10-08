
# Barbearia - Projeto Final 

Bem-vindo ao sistema de agendamentos da barbearia! Este projeto foi desenvolvido para gerenciar os agendamentos de uma barbearia, permitindo que os administradores visualizem, atualizem e excluam os agendamentos de maneira eficiente.

## Tecnologias Utilizadas
- Front-end: HTML, CSS, JavaScript, Swiper.js
- Back-end: Node.js, Express, body-parser, Express-handlebars, express-session, passport, bcryptjs, dotenv
- Banco de Dados: MySQL

## Funcionalidades
1. Criar Agendamento:
- Os clientes podem agendar um horário para um serviço na barbearia.
- O formulário de agendamento coleta informações como nome, telefone, data, hora e tipo de serviço.

2. Visualizar Agendamentos:
- Os administradores podem visualizar uma lista de todos os agendamentos.
- A lista inclui detalhes como nome do cliente,telefone, data, hora, e tipo de serviço.

3. Atualizar Agendamento:
- Os administradores podem atualizar as informações de um agendamento existente.
- Isso permite ajustar datas, horários e outros detalhes conforme necessário.

4. Deletar Agendamento:
- Os administradores podem excluir agendamentos que não são mais necessários.
- Isso ajuda a manter o sistema organizado e livre de agendamentos antigos ou cancelados.

5. Autenticação de Administrador
- Somente usuários autenticados como administradores podem acessar a área de gerenciamento de agendamentos.

6. Interface Intuitiva
- O sistema possui uma interface de usuário simples e intuitiva, facilitando a navegação e uso do sistema.

## Pré-requisitos
Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em seu ambiente de desenvolvimento:
- Node.js
- MySQL

## Passos de Instalação
1. Clone o repositório para sua máquina local:
```
git clone git@github.com:Mateusveloso26/Barbearia.git
```
2. Navegue até o diretório do projeto:
```
cd Barbearia
```
3. Instale as dependências do projeto usando npm:
```
npm install
```
4. Configure as variáveis de ambiente no arquivo .env
```
PORT = <sua_porta>
CHAVE = <sua_chave>

```

5. Na pasta config/db, configure a conexão com o banco de dados MySQL utilizando Sequelize. O arquivo de configuração deve ser semelhante ao seguinte:
```
const sequelize = new Sequelize('barbearia', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
})
```

6. Execute a aplicação:
```
npm run dev
```
7. Abra o navegador e acesse:
```
http://localhost:3333
```

![barbearia](https://github.com/Mateusveloso26/Barbearia/assets/135018940/354fa7b8-12e3-4483-bd60-737f587d7b1b)







