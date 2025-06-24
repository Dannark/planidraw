# Configuração do Planidraw - Sistema de Compartilhamento 3D

## 1. Configuração do Firebase

### 1.1 Criar projeto no Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Digite um nome para o projeto (ex: "planidraw-3d")
4. Siga os passos de configuração

### 1.2 Habilitar serviços
1. **Firestore Database**: 
   - Vá para "Firestore Database" no menu lateral
   - Clique em "Criar banco de dados"
   - Escolha "Iniciar no modo de teste" (para desenvolvimento)
   - Escolha uma localização (ex: us-central1)

2. **Storage**:
   - Vá para "Storage" no menu lateral
   - Clique em "Começar"
   - Escolha "Iniciar no modo de teste" (para desenvolvimento)
   - Escolha a mesma localização do Firestore

### 1.3 Configurar regras de segurança

**Firestore Rules** (vá para Firestore > Regras):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scenes/{sceneId} {
      allow read, write: if true; // Para desenvolvimento - altere para produção
    }
  }
}
```

**Storage Rules** (vá para Storage > Regras):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /models/{modelId}/{allPaths=**} {
      allow read, write: if true; // Para desenvolvimento - altere para produção
    }
  }
}
```

### 1.4 Obter configuração do projeto
1. Vá para "Configurações do projeto" (ícone de engrenagem)
2. Clique em "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique em "Web" (ícone </>)
5. Digite um nome para o app (ex: "planidraw-web")
6. Copie a configuração que aparece

### 1.5 Atualizar configuração no código
Abra `src/config/firebase.ts` e substitua a configuração:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key-real",
  authDomain: "seu-projeto-real.firebaseapp.com",
  projectId: "seu-projeto-real-id",
  storageBucket: "seu-projeto-real.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id-real"
};
```

## 2. Configuração do GitHub Pages

### 2.1 Atualizar homepage no package.json
Substitua `danielusername` pelo seu nome de usuário do GitHub:

```json
{
  "homepage": "https://SEU_USERNAME.github.io/planidraw"
}
```

### 2.2 Instalar dependências
```bash
npm install
```

### 2.3 Fazer deploy
```bash
npm run deploy
```

### 2.4 Configurar GitHub Pages
1. Vá para o repositório no GitHub
2. Clique em "Settings"
3. Role para baixo até "Pages"
4. Em "Source", selecione "Deploy from a branch"
5. Selecione a branch "gh-pages"
6. Clique em "Save"

## 3. Testando o Sistema

### 3.1 Teste local
```bash
npm start
```

### 3.2 Fluxo de teste
1. Acesse a aplicação
2. Clique em "Arquivo" > "Importar Modelo 3D"
3. Selecione um arquivo .glb ou .gltf
4. Após o carregamento, clique em "Arquivo" > "Salvar Cena"
5. Preencha o nome e descrição
6. Clique em "Salvar Cena"
7. Copie o link gerado
8. Abra o link em uma nova aba para testar o compartilhamento

### 3.3 Estrutura dos dados
O sistema salva:
- **Firestore**: Configuração da cena (nome, descrição, URL do arquivo, posição da câmera)
- **Storage**: Arquivo .glb/.gltf na pasta `models/{id}/`

## 4. URLs de Exemplo

Após o deploy, suas URLs serão:
- **Aplicação principal**: `https://SEU_USERNAME.github.io/planidraw`
- **Visualização compartilhável**: `https://SEU_USERNAME.github.io/planidraw/viewer/{id}`

## 5. Troubleshooting

### Erro de CORS
Se houver erro de CORS no Firebase Storage, verifique se as regras estão configuradas corretamente.

### Erro de roteamento no GitHub Pages
Para SPA (Single Page Application), você pode precisar configurar um arquivo `404.html` que redirecione para `index.html`.

### Erro de módulos não encontrados
Execute `npm install` novamente e verifique se todas as dependências estão instaladas.

## 6. Próximos Passos

1. **Segurança**: Configure regras de segurança adequadas para produção
2. **Autenticação**: Adicione sistema de login se necessário
3. **Limites**: Configure limites de upload e armazenamento
4. **CDN**: Configure CDN para melhor performance
5. **Analytics**: Adicione Google Analytics para monitoramento 