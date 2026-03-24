// MSAL Configuration
const msalConfig = {
    auth: {
        // IMPORTANT: Replace these with your actual Azure Entra ID Application configuration!
        clientId: "YOUR_CLIENT_ID_HERE", 
        authority: "https://login.microsoftonline.com/YOUR_TENANT_ID_HERE", 
        redirectUri: window.location.origin, // Ensures it returns to Vercel/localhost correctly
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// Initialize MSAL and check for existing login session
msalInstance.initialize().then(() => {
    // Optional: Handle redirect promise if using redirect flow instead of popup
    msalInstance.handleRedirectPromise().then((response) => {
        if (response !== null) {
            updateUI(response.account);
        } else {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                updateUI(accounts[0]);
            }
        }
    }).catch(error => {
        console.error("Login redirect error:", error);
    });
});

async function login() {
    try {
        const loginResponse = await msalInstance.loginPopup({
            scopes: ["User.Read"] // Include API scopes if required
        });
        updateUI(loginResponse.account);
    } catch (error) {
        console.error("Login popup failed:", error);
    }
}

function logout() {
    msalInstance.logoutPopup().then(() => {
        window.location.reload();
    });
}

function updateUI(account) {
    // Update all auth buttons across the app to show Sign Out state
    const loginBtns = document.querySelectorAll('.auth-buttons button');
    loginBtns.forEach(btn => {
        btn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Sign out (${account.username})`;
        btn.onclick = logout;
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-primary');
    });
}

// Hook for fetching Bearer token for secure API Calls
async function getAccessToken() {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) return null;
    
    try {
        const response = await msalInstance.acquireTokenSilent({
            scopes: ["User.Read"], // Should match your backend scopes/App ID URI
            account: accounts[0]
        });
        return response.accessToken;
    } catch (error) {
        console.error("Silent token acquisition failed:", error);
        return null;
    }
}
