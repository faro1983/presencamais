
# PresencaMais

Projeto Expo + EAS Build em TypeScript para registro de presença por reconhecimento facial. Toda UI em português (pt-BR).

Conteúdo importante incluído neste repositório:

- `app.json` e `eas.json` com configuração Android (package: `br.com.suaescola.appfrequencia`).
- Exemplo de inicialização do Firebase cliente: `src/services/firebase.ts` (usa variáveis `EXPO_PUBLIC_...`).
- Telas principais em `src/screens/` (incl. `CadastroResponsavel.tsx`, `RegistroFace.tsx`).
- Exemplos de Cloud Functions: `cloud-functions/registrarFace.ts`, `cloud-functions/verificarFace.ts`.
- Exemplo de regras do Firestore: `firestore.rules`.
- Arquivo de strings em pt-BR: `src/i18n/pt-BR.ts`.
- Exemplo de `.env.example` com placeholders para desenvolvimento local.

Instalação e execução (desenvolvimento):

1. Instale dependências:

```bash
npm install
```

2. Arquivo de variáveis para desenvolvimento local (opcional):

Crie um arquivo `.env` local a partir de `.env.example` com seus valores. Nunca comite `.env`.

```bash
cp .env.example .env
# editar .env com seus valores
```

3. Variáveis do Firebase (cliente)

Defina as seguintes variáveis públicas no `.env` ou no ambiente de build (EAS). No cliente só devem ser usadas variáveis públicas com prefixo `EXPO_PUBLIC_`.

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

4. Configurar Cloud Functions (backend) e variáveis sensíveis

As chaves sensíveis (por ex. `AZURE_FACE_KEY`, `AZURE_FACE_ENDPOINT`, e o service account do Firebase) NUNCA devem ficar no cliente. Use `firebase functions:config:set` ou secrets do provedor de CI/EAS.

Exemplo usando Firebase CLI (na pasta das funções ou com `--project`):

```bash
npm install -g firebase-tools
firebase login
firebase init functions
firebase functions:config:set azure.key="SUA_AZURE_FACE_KEY" azure.endpoint="SUA_AZURE_FACE_ENDPOINT" limiar_confidencia="0.9"
firebase deploy --only functions
```

No código das funções (ex.: `cloud-functions/registrarFace.ts`) use `process.env` ou `functions.config()` conforme necessário.

Se o deploy do Firebase retornar `403 Permission denied to get service [artifactregistry.googleapis.com]`, habilite manualmente as APIs no projeto e revise as permissões da service account (Cloud Build, Artifact Registry, Cloud Functions e Service Account User).

5. Executar o app em desenvolvimento

```bash
npm install
expo start
```

Abra no simulador ou em um dispositivo (com Expo Go ou um cliente dev). Após login, as telas carregarão dados de `turmas` e `alunos` diretamente do Firestore se as variáveis do Firebase estiverem configuradas.

6. Builds Android com EAS (standalone APK/AAB)

Instale a CLI do EAS e configure credenciais:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Gerar builds (exemplo perfis):

```bash
# APK (instalável diretamente em dispositivos Android)
eas build --platform android --profile production-apk

# AAB / App Bundle (para publicar na Google Play)
eas build --platform android --profile production-aab
```

No processo de build você pode fornecer variáveis de ambiente seguras no EAS Dashboard ou usando `eas secret`.

Secrets obrigatórios para o GitHub Actions:

- `EAS_TOKEN`: token de acesso do Expo/EAS.
- `EAS_PROJECT_ID`: UUID do projeto EAS, obtido ao vincular o app no Expo (`eas init`) ou no painel do Expo.
- `GOOGLE_SERVICES_JSON`: conteúdo completo do `google-services.json`.
- `FIREBASE_SERVICE_ACCOUNT` ou `FIREBASE_TOKEN`: credencial para deploy das Cloud Functions.

Se o workflow ainda mostrar `EAS project not configured`, o `EAS_PROJECT_ID` não foi informado no secret ou o app ainda não foi vinculado no Expo.

7. Keys e keystore Android

Use `eas credentials` para gerar/gerenciar keystore Android. O EAS pode armazenar as credenciais para você com segurança.

8. Testando Cloud Functions localmente (opcional)

Você pode emular funções localmente com o Firebase Emulator Suite:

```bash
firebase emulators:start --only functions,firestore
```

9. Notas de segurança e conformidade

- Sempre obter consentimento escrito dos responsáveis antes de coletar dados biométricos.
- Minimizar armazenamento de imagens; preferir embeddings/faceIds.
- Armazenar chaves sensíveis apenas no backend e no gerenciador de secrets.

10. Próximos passos sugeridos

- Personalizar UI e estilos (use `react-native-paper` disponível no projeto).
- Implementar endpoints reais que chamem o serviço de reconhecimento facial (Azure Face API) nas Cloud Functions.
- Ajustar Firestore Rules em `firestore.rules` para aderir às políticas de autorização da sua instituição.

Comandos rápidos resumidos:

```bash
# instalar dependências
npm install

# rodar em dev
expo start

# deploy functions
firebase deploy --only functions

# build apk com EAS
eas build --platform android --profile production
```

Se quiser, posso: gerar um arquivo `.env` de exemplo com instruções mais detalhadas, configurar scripts adicionais no `package.json`, ou preparar um script de deploy automatizado. Deseja que eu adicione instruções específicas para o seu projeto (ex.: nomes de projeto Firebase, endpoints)?

**Scripts úteis (npm)**

Adicionei scripts ao `package.json` para facilitar deploy local e CI. Exemplos:

```bash
# Fazer deploy das Cloud Functions (usa secrets no ambiente)
npm run build:functions

# Fazer build Android via EAS (production)
npm run eas:build

# Pipeline local/CI: deploy de functions e em seguida build EAS
npm run ci:deploy
```

Observações:
- Os scripts assumem que você tenha as variáveis de ambiente apropriadas configuradas no ambiente (ou em secrets do CI): `FIREBASE_TOKEN`, `FIREBASE_PROJECT_ID`, `EAS_TOKEN`.
- No Windows PowerShell você pode definir temporariamente (exemplo):

```powershell
$env:FIREBASE_TOKEN = "seu_token"
$env:FIREBASE_PROJECT_ID = "seu_project_id"
$env:EAS_TOKEN = "seu_eas_token"
npm run ci:deploy
```

- No Linux/macOS (bash):

```bash
export FIREBASE_TOKEN="seu_token"
export FIREBASE_PROJECT_ID="seu_project_id"
export EAS_TOKEN="seu_eas_token"
npm run ci:deploy
```

Lembrete de segurança: nunca comite tokens ou arquivos com secrets no repositório. Use os Secrets do GitHub Actions ou o gerenciador de secrets do seu provedor de CI.

Protegendo `google-services.json` e usando CI/Secrets
---------------------------------------------------

O arquivo `google-services.json` contém chaves sensíveis do Firebase. Ele não deve ser comitado em repositórios públicos.

Opções recomendadas para builds (EAS/CI):

1) Armazenar o conteúdo do `google-services.json` como um Secret no GitHub (ex.: `GOOGLE_SERVICES_JSON`) e gravar o arquivo no workflow antes do build:

```yaml
# exemplo de step em GitHub Actions antes de rodar `eas build`
- name: Escrever google-services.json a partir do secret
	run: |
		echo "$GOOGLE_SERVICES_JSON" > ./google-services.json
	env:
		GOOGLE_SERVICES_JSON: ${{ secrets.GOOGLE_SERVICES_JSON }}
```

2) Alternativa: armazenar o `google-services.json` em um storage seguro e baixar no workflow usando credenciais de CI, salvando o arquivo localmente antes do build.

3) EAS Build + Secrets: você também pode usar `eas secret` para definir variáveis de ambiente usadas no build e montar o arquivo via script de pré-build.

Depois de criar o arquivo no runner (ou no servidor de build), o processo de build nativo irá incluir automaticamente as configurações do Firebase.

Remoção do arquivo do repositório
---------------------------------
Removi `google-services.json` do repositório e adicionei uma entrada em `.gitignore`. Use um secret no CI para injetar o arquivo no momento do build.
