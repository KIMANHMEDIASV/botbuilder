# Deploy a Bot Framework Web Chat client to Azure

This guide shows how to host the Bot Framework Web Chat client for an existing bot on Azure. It uses Azure Storage static website hosting so you can publish a simple HTML page that connects to your bot through the Direct Line channel.

## Prerequisites

- An existing bot published to Azure Bot Service.
- An Azure subscription with [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) installed and signed in (`az login`).
- A local copy of the Bot Framework Samples repository to reuse the Web Chat page from [`samples/javascript_es6/70.styling-webchat`](../samples/javascript_es6/70.styling-webchat/index.html).

## 1. Prepare your Web Chat page

1. Create a folder named `webchat` and copy [`samples/javascript_es6/70.styling-webchat/index.html`](../samples/javascript_es6/70.styling-webchat/index.html) into it as `index.html`.
2. In the copied file, replace `YOUR_BOT_SECRET_FROM_AZURE` with your Direct Line secret (you will obtain this in the next section).
3. Optionally customize the styling or locale to match your brand before publishing.

## 2. Enable the Web Chat channel and retrieve the Direct Line secret

1. Open the **Azure portal** and navigate to your bot resource.
2. Select **Channels** > **Web Chat** and create a Direct Line site if one does not exist.
3. Copy one of the **Secrets**; this value will authenticate the Web Chat client. If you prefer to avoid embedding the secret in the page, use a token-generating endpoint instead and update the page accordingly.
4. Under **Allowed origins**, add the domain you plan to use for your static site (you can update this after deployment once you know the URL).

## 3. Deploy the static page to Azure Storage

The following script provisions a resource group and a Storage account configured for static website hosting, then uploads the `webchat` folder contents.

```bash
# Variables
RESOURCE_GROUP=rg-webchat-demo
LOCATION=eastus
STORAGE_ACCOUNT=webchat$RANDOM

# Create the resource group and storage account
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --kind StorageV2 \
  --sku Standard_LRS \
  --https-only true

# Enable static website hosting and upload the page
az storage blob service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --static-website \
  --index-document index.html
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --source ./webchat \
  --destination '$web'

# Retrieve the public URL
az storage account show \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query "primaryEndpoints.web" \
  --output tsv
```

Record the URL returned by the final command; this is where your Web Chat page is hosted.

## 4. Allow the static site origin in Direct Line

Return to the **Web Chat** channel configuration for your bot and add the static site URL to **Allowed origins**. This ensures the Web Chat client can request Direct Line tokens from your bot.

## 5. Test the deployment

1. Open the static site URL in a browser to load Web Chat.
2. Send a few messages to confirm the bot responds as expected.
3. Update the `webchat/index.html` file locally and rerun the upload commands to publish changes.

## Cleanup

When you no longer need the deployment, remove the resource group to delete all associated resources:

```bash
az group delete --name "$RESOURCE_GROUP" --yes --no-wait
```
