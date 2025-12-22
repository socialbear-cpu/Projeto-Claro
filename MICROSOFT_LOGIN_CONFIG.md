# Configuração de Microsoft OAuth - Controle EPO

## Passos para Configurar Login com Microsoft

### 1. Registrar Aplicação no Azure Portal

1. Acesse [Azure Portal](https://portal.azure.com)
2. Clique em **Azure Active Directory** no menu lateral
3. Vá para **App registrations**
4. Clique em **New registration**
5. Preencha os dados:
   - **Name**: "Controle EPO" (ou outro nome desejado)
   - **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: Selecione "Web" e insira `http://localhost:3000/login.html`
6. Clique em **Register**

### 2. Obter Client ID

1. Na página da aplicação, copie o **Application (client) ID**
2. Abra o arquivo `msalConfig.js` neste projeto
3. Procure por: `clientId: "SEU_CLIENT_ID_AQUI"`
4. Substitua `"SEU_CLIENT_ID_AQUI"` pelo Client ID copiado

### 3. Configurar URI de Redirecionamento

Dependendo de onde você vai hospedar:

**Para desenvolvimento local:**
```
http://localhost:3000/login.html
```

**Para produção (exemplo):**
```
https://seu-dominio.com/login.html
```

1. Vá para **Authentication** na aplicação do Azure
2. Em **Redirect URIs**, clique em **Add a Redirect URI**
3. Insira a URL correta conforme seu ambiente
4. Clique em **Save**

### 4. (Opcional) Configurar Client Secret

Se você precisar fazer chamadas backend:

1. Vá para **Certificates & secrets**
2. Clique em **New client secret**
3. Preencha a descrição e validade
4. Clique em **Add**
5. **Copie o valor** (você não conseguirá vê-lo novamente!)

### 5. Atualizar msalConfig.js se necessário

O arquivo já contém a configuração básica. Se você quiser configurações avançadas:

```javascript
const msalConfig = {
    auth: {
        clientId: "SEU_CLIENT_ID_AQUI",
        authority: "https://login.microsoftonline.com/common", // multi-tenant
        // ou use seu tenant específico:
        // authority: "https://login.microsoftonline.com/SEU_TENANT_ID",
        redirectUri: "http://localhost:3000/login.html"
    }
};
```

### 6. Testar Login

1. Abra `login.html` no navegador (ou inicie um servidor local)
2. Clique em "Entrar com Microsoft"
3. Você será redirecionado para o login da Microsoft
4. Após autenticar com sucesso, será redirecionado para `front.html`

## Segurança

⚠️ **Importante:**
- **Nunca** publique seu Client Secret em código frontend
- Para chamadas de API backend, use um servidor seguro
- O Client ID é público e pode estar no código frontend
- Os tokens são armazenados no localStorage (configure com cuidado em produção)

## Troubleshooting

### "Client ID não configurado"
- Verifique se msalConfig.js foi atualizado com seu Client ID

### "Popup bloqueado"
- Permita popups do seu site no navegador
- Use `loginPopup()` ou `loginRedirect()` conforme necessário

### "Redirect URI não corresponde"
- Verifique se a URL no msalConfig.js corresponde exatamente ao configurado no Azure
- Inclua http:// ou https://

### CORS errors
- Para chamadas de API, configure CORS no seu backend
- Use o Microsoft Graph com MSAL está automaticamente configurado

## Documentação

- [MSAL.js Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)
- [Azure Portal](https://portal.azure.com)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/api/overview)

## Contato

Para dúvidas sobre configuração, consulte a documentação oficial da Microsoft.
