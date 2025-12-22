/**
 * MSAL Configuration for Microsoft OAuth
 * 
 * INSTRUÇÕES PARA CONFIGURAR:
 * 1. Acesse https://portal.azure.com
 * 2. Vá para "Azure Active Directory" > "App registrations"
 * 3. Clique em "New registration"
 * 4. Preencha os dados e salve
 * 5. Copie o "Client ID" (Application ID) abaixo
 * 6. Vá para "Certificates & secrets" e crie um novo "Client secret"
 * 7. Configure as "Redirect URIs" para incluir: http://localhost:3000/login.html
 * 8. Copie seu "Tenant ID"
 */

const msalConfig = {
    auth: {
        clientId: "SEU_CLIENT_ID_AQUI", // Obtenha no Azure Portal
        authority: "https://login.microsoftonline.com/common", // Multi-tenant
        redirectUri: window.location.origin + "/login.html",
        postLogoutRedirectUri: window.location.origin + "/login.html"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case msal.LogLevel.Error:
                        console.error(message);
                        return;
                    case msal.LogLevel.Info:
                        console.info(message);
                        return;
                    case msal.LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case msal.LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

const loginRequest = {
    scopes: ["user.read"]
};

const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};
