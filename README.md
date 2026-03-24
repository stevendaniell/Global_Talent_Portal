# Global Talent Portal

A web application designed for the global talent acquisition process. This platform allows candidates to upload their resumes seamlessly, and provides recruiters with an intuitive search interface to find the perfect candidates for their roles.

## Features
- **Candidate Portal:** Secure resume upload functionality.
- **Recruiter Portal:** Search and filter capabilities to browse candidate profiles.

## Architecture
This project is built using a modern, scalable cloud-native architecture:
- **Frontend:** Lightweight and fast, designed to be hosted on Azure Static Web Apps.
- **Backend:** Java Spring Boot application exposing secure REST APIs.
- **Database:** Azure Cosmos DB for scalable candidate profile storage.
- **Storage:** Azure Blob Storage for handling resume PDF uploads.
- **Authentication:** Integrated with Azure Entra ID for secure access management.
