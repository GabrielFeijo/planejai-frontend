# PlanejAí - Sistema Colaborativo de Gestão de Tarefas

O **PlanejAí** é uma interface web moderna e intuitiva para gestão colaborativa de tarefas e projetos. A aplicação oferece uma experiência fluida com atualizações em tempo real, drag & drop, e uma interface inspirada nos melhores sistemas de produtividade do mercado.

### 📸 Screenshots

![Dashboard Principal](https://i.imgur.com/ukNMZzu.png)
_Dashboard principal com todos os boards_

![Criação de boards](https://i.imgur.com/6ZStp0p.png)
_Modal para criação e edição de boards_

![Board View](https://i.imgur.com/loSQXRQ.png)
_Visualização detalhada do board com listas e tarefas_

![Criação de Tarefa](https://i.imgur.com/7TlFAXH.png)
_Modal para criação e edição de tarefas_

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- API PlanejAí rodando (backend)

## 🚀 Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/GabrielFeijo/planejai-frontend.git
   cd planejai-frontend
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto:

   ```env
    NEXT_PUBLIC_API_URL="http://localhost:3333"
   ```

4. **Execute o projeto**

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse a aplicação**
   Abra seu navegador e acesse: `http://localhost:3000`

### 📡 Eventos em Tempo Real

| Evento          | Descrição            | Dados                            |
| --------------- | -------------------- | -------------------------------- |
| `board-updated` | Board foi modificado | `{ boardId, changes }`           |
| `list-created`  | Nova lista criada    | `{ boardId, list }`              |
| `list-updated`  | Lista modificada     | `{ boardId, listId, changes }`   |
| `list-deleted`  | Lista removida       | `{ boardId, listId }`            |
| `card-created`  | Nova tarefa criada   | `{ listId, card }`               |
| `card-updated`  | Tarefa modificada    | `{ cardId, changes }`            |
| `card-moved`    | Tarefa movida        | `{ cardId, toListId, position }` |

---

## 🛠️ Feito com

<div align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nestjs/nestjs-original.svg" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/socketio/socketio-original.svg" width="40" height="40"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swagger/swagger-original.svg" width="40" height="40"/>
</div>
