# Planidraw - Visualizador 3D Compartilhável

Um visualizador 3D moderno construído com React, Three.js e Firebase, que permite importar modelos 3D (.glb/.gltf) e compartilhá-los através de links únicos.

## 🚀 Funcionalidades

- **Importação de Modelos 3D**: Suporte para arquivos .glb e .gltf
- **Visualização 3D/2D**: Alternância entre visualização 3D e planta baixa
- **Compartilhamento**: Gera links únicos para compartilhar modelos 3D
- **Interface Moderna**: UI intuitiva com controles de câmera
- **Lista de Objetos**: Painel lateral com lista de objetos do modelo
- **Controles de Visibilidade**: Mostrar/ocultar objetos individuais

## 🛠️ Tecnologias

- **Frontend**: React 19, TypeScript, Three.js
- **3D Graphics**: @react-three/fiber, @react-three/drei
- **Backend**: Firebase (Firestore + Storage)
- **Roteamento**: React Router DOM
- **Deploy**: GitHub Pages

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Dannark/planidraw.git
cd planidraw
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase (veja [SETUP.md](./SETUP.md))

4. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## 🔧 Configuração

### Firebase Setup
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Habilite Firestore Database e Storage
3. Configure as regras de segurança
4. Atualize a configuração em `src/config/firebase.ts`

### GitHub Pages
1. Atualize o `homepage` no `package.json` com seu username
2. Execute `npm run deploy`
3. Configure GitHub Pages nas configurações do repositório

Veja o arquivo [SETUP.md](./SETUP.md) para instruções detalhadas.

## 📖 Como Usar

### Importando um Modelo
1. Clique em "Arquivo" > "Importar Modelo 3D"
2. Selecione um arquivo .glb ou .gltf
3. O modelo será carregado na cena

### Salvando e Compartilhando
1. Após importar um modelo, clique em "Arquivo" > "Salvar Cena"
2. Preencha o nome e descrição (opcional)
3. Clique em "Salvar Cena"
4. Copie o link gerado para compartilhar

### Visualizando um Modelo Compartilhado
1. Acesse o link compartilhável (ex: `/viewer/{id}`)
2. O modelo será carregado automaticamente
3. Use os controles para navegar na cena

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── Controls/           # Controles de câmera
│   ├── InterfaceControls/  # Controles da interface
│   ├── MainMenu/          # Menu principal
│   ├── ObjectListPanel/   # Painel de objetos
│   ├── SaveSceneModal/    # Modal de salvar cena
│   ├── SharedViewer/      # Visualizador compartilhável
│   └── Wall/              # Componentes de parede
├── config/
│   ├── ConfigContext.tsx  # Contexto de configuração
│   └── firebase.ts        # Configuração do Firebase
├── hooks/                 # Hooks customizados
├── scenes/
│   ├── ImportScene.tsx    # Cena de importação
│   └── MainScene.tsx      # Cena principal
├── services/
│   └── modelService.ts    # Serviço de modelos
└── utils/                 # Utilitários
```

## 🔗 URLs

- **Aplicação Principal**: `https://Dannark.github.io/planidraw`
- **Visualização Compartilhável**: `https://Dannark.github.io/planidraw/viewer/{id}`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique o arquivo [SETUP.md](./SETUP.md) para configurações
2. Abra uma [issue](https://github.com/Dannark/planidraw/issues)
3. Consulte a documentação do [Three.js](https://threejs.org/docs/) e [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

## 🚀 Próximas Funcionalidades

- [ ] Autenticação de usuários
- [ ] Galeria de modelos salvos
- [ ] Anotações em 3D
- [ ] Exportação de imagens
- [ ] Colaboração em tempo real
- [ ] Suporte a mais formatos 3D
