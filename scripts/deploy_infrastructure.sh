#!/bin/bash
# Global Talent Portal - Azure Infrastructure Deployment Script
# This script provisions the Azure resources required for the Global Talent Portal

set -e

# Configuration Variables
RESOURCE_GROUP="rg-global-talent-portal"
LOCATION="eastus"

# Generate a unique suffix to avoid naming conflicts
SUFFIX=$RANDOM
COSMOS_ACCOUNT="talentdb-${SUFFIX}"
STORAGE_ACCOUNT="talentstore${SUFFIX}"
APP_SERVICE_PLAN="asp-global-talent-${SUFFIX}"
WEB_APP_NAME="app-talent-backend-${SUFFIX}"
STATIC_WEB_APP="stapp-talent-frontend-${SUFFIX}"

echo "Starting Global Talent Portal Infrastructure Deployment..."
echo "Resource Group: $RESOURCE_GROUP in $LOCATION"

# 1. Create Resource Group
echo "Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION -o none
echo "Resource Group created successfully."

# 2. Create Azure Cosmos DB (Serverless NoSQL)
echo "Creating Azure Cosmos DB Account (Serverless)... this might take a few minutes."
az cosmosdb create \
    --name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --locations regionName=$LOCATION failoverPriority=0 isZoneRedundant=False \
    --capabilities EnableServerless \
    --default-consistency-level Session \
    -o none
echo "Cosmos DB Account created."

echo "Creating Database 'TalentDB'..."
az cosmosdb sql database create \
    --account-name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --name TalentDB \
    -o none

echo "Creating Container 'Candidates' with partition key '/title'..."
az cosmosdb sql container create \
    --account-name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --database-name TalentDB \
    --name Candidates \
    --partition-key-path "/title" \
    -o none

# 3. Create Storage Account and Blob Container
echo "Creating Storage Account..."
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --allow-blob-public-access true \
    -o none

echo "Creating Blob Container 'resumes'..."
# Get connection string to create container
STORAGE_CONN_STR=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP -o tsv)
az storage container create \
    --name resumes \
    --connection-string $STORAGE_CONN_STR \
    --public-access blob \
    -o none
echo "Storage Account and Container created."

# 4. Create Azure App Service (Backend)
echo "Creating App Service Plan (B1)..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux \
    -o none

echo "Creating Web App (Java 17, Java SE)..."
az webapp create \
    --name $WEB_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "JAVA:17-java11" \
    -o none
echo "Web App created."

# 5. Create Static Web App (Frontend)
echo "Creating Azure Static Web App..."
az staticwebapp create \
    --name $STATIC_WEB_APP \
    --resource-group $RESOURCE_GROUP \
    --location "eastus2" \
    --sku Free \
    -o none
echo "Static Web App created."

# Retrieve Keys and Endpoints for the user
echo ""
echo "================================================="
echo "DEPLOYMENT SUCCESSFUL! HERE ARE YOUR CREDENTIALS:"
echo "================================================="

COSMOS_ENDPOINT=$(az cosmosdb show --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --query documentEndpoint -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --type keys --query primaryMasterKey -o tsv)
BLOB_ENDPOINT=$(az storage account show --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query primaryEndpoints.blob -o tsv)

echo ""
echo "Cosmos DB Endpoint: $COSMOS_ENDPOINT"
echo "Cosmos DB Key: $COSMOS_KEY"
echo "Storage Blob Endpoint: $BLOB_ENDPOINT"
echo ""
echo "Backend App Service Name: $WEB_APP_NAME"
echo "Frontend Static Web App Name: $STATIC_WEB_APP"
echo "Backend App URL: https://$WEB_APP_NAME.azurewebsites.net"
echo ""
echo "Please save these details. You will need them to configure your backend secrets and deploy your code!"
echo "================================================="
