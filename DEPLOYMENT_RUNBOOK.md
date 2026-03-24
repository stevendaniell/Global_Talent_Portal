# Global Talent Portal: Deployment Runbook

This document provides a single-pass, step-by-step guide for moving the Global Talent Portal from a local development state to a live production environment on Microsoft Azure.

---

## Phase 1: Azure Resource Provisioning
*Goal: Create the "physical" infrastructure where the code will live.*

1.  **Create a Resource Group:**
    *   Name: `rg-global-talent-portal`
    *   Region: (e.g., `East US`)
2.  **Create an Azure Cosmos DB Account:**
    *   API: **Azure Cosmos DB for NoSQL**.
    *   Capacity Mode: **Serverless** (to minimize costs as per project mandates).
    *   Database Name: `TalentDB`
    *   Container Name: `Candidates` (Partition Key: `/title`).
3.  **Create an Azure Storage Account:**
    *   Performance: **Standard**.
    *   Redundancy: **Locally-redundant storage (LRS)**.
    *   Create a Blob Container named `resumes` and set its access level to **Blob (anonymous read access for blobs only)** so recruiters can view the PDFs via URL.
4.  **Create an Azure App Service (for Backend):**
    *   Publish: **Code**.
    *   Runtime stack: **Java 17**.
    *   Java web server stack: **Java SE** (Embedded Spring Boot).
    *   Plan: **B1** (Basic) or **F1** (Free) for initial testing.
5.  **Create an Azure Static Web App (for Frontend):**
    *   Plan Type: **Free**.
    *   Deployment details: Choose **GitHub** (this will automatically create a CI/CD workflow file for you).

---

## Phase 2: Identity Setup (Azure Entra ID)
*Goal: Secure the portal so only authorized users can access it.*

1.  **Register an Application:**
    *   Go to **Microsoft Entra ID** > **App registrations** > **New registration**.
    *   Name: `GlobalTalentPortal-App`.
    *   Supported account types: **Accounts in this organizational directory only**.
2.  **Configure Authentication:**
    *   Add a platform: **Web**.
    *   Redirect URI: `https://<your-static-web-app-url>/.auth/login/aad/callback`.
3.  **Generate Secrets:**
    *   Go to **Certificates & secrets** > **New client secret**.
    *   **CRITICAL:** Copy the **Value** immediately; you will not see it again.

---

## Phase 3: Secure Configuration (Environment Variables)
*Goal: Connect the code to the resources without hardcoding keys.*

**DO NOT** edit the `application.properties` file directly with real keys. Instead, go to your **Azure App Service** > **Configuration** > **Application settings** and add the following:

| Name | Value |
| :--- | :--- |
| `SPRING_CLOUD_AZURE_COSMOS_ENDPOINT` | Your Cosmos DB URI (from Keys tab) |
| `SPRING_CLOUD_AZURE_COSMOS_KEY` | Your Cosmos DB Primary Key |
| `SPRING_CLOUD_AZURE_STORAGE_BLOB_ENDPOINT` | Your Storage Account Blob Endpoint |
| `SPRING_CLOUD_AZURE_ACTIVE_DIRECTORY_PROFILE_TENANT_ID` | Your Directory (tenant) ID |
| `SPRING_CLOUD_AZURE_ACTIVE_DIRECTORY_CREDENTIAL_CLIENT_ID` | Your Application (client) ID |
| `SPRING_CLOUD_AZURE_ACTIVE_DIRECTORY_CREDENTIAL_CLIENT_SECRET` | Your Client Secret Value |

---

## Phase 4: Build and Deploy (The Execution)
*Goal: Package and upload the code.*

1.  **Backend (Java):**
    *   Run: `./mvnw clean package` in the `backend` folder.
    *   Upload the resulting `.jar` file (found in `/target/`) to the Azure App Service using the **Azure CLI** or **VS Code Azure Extension**.
2.  **Frontend (Web):**
    *   Update `frontend/js/app.js`: Ensure the `API_BASE_URL` logic correctly points to your live App Service URL if they are on different domains.
    *   Push your code to the GitHub repository connected to your **Azure Static Web App**. Azure will automatically detect the HTML/JS and deploy it.

---

## Phase 5: Final Validation
*Goal: Verify the "End-to-End" flow.*

1.  **Upload Test:** Navigate to your Static Web App URL, go to `upload.html`, and upload a sample PDF.
2.  **Storage Check:** Verify the PDF appears in your Azure Storage `resumes` container.
3.  **Database Check:** Verify a new entry appears in the Cosmos DB `Candidates` container.
4.  **Search Test:** Go to `search.html` and search for a skill you added to the test candidate.

---
**Stakeholder Note:** Following these steps exactly will result in a fully functional, secure, and production-ready instance of the Global Talent Portal.
