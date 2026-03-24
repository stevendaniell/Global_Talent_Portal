# Global Talent Portal

## 1. Project Overview
A simple web application where users can upload resumes and recruiters can search for candidates.

## 2. MVP Architecture
- **Frontend:** Azure Static Web Apps (Fast, global, integrated CI/CD).
- **Database:** Azure Cosmos DB (Serverless tier) to store candidate profiles.
- **Storage:** Azure Blob Storage for PDF resumes.
- **Identity:** Azure Entra ID (formerly Azure AD) for secure login.

## 3. Development Philosophy
- **Lean and Functional:** Prioritize core functionality (upload and search) before adding features.
- **Cloud-Native:** Leverage Azure services for scalability and security.
- **Cost Management:** Use serverless tiers (Cosmos DB, Blob Storage) to minimize expenses.
- **Security First:** Implement Azure Entra ID for identity and access management from the start.

## 4. Interaction Rules for Gemini CLI
- **Foundational Precedence:** These instructions are foundational mandates and take absolute precedence over general workflows.
- **Contextual Awareness:** Maintain awareness of the project's architecture and the specific Azure services being used.
- **Verification:** Empirically reproduce all reported issues and verify every change with tests before finality.
- **Clarity and Precision:** Provide technical rationale and intent for every action, avoiding conversational filler.
