/**
 * npm install @azure/identity @azure/arm-logic
 * node logic-app-rss.js
 */

const { DefaultAzureCredential } = require("@azure/identity");
const { LogicManagementClient } = require("@azure/arm-logic");

async function createLogicApp() {
    const subscriptionId = "your-subscription-id";
    const resourceGroupName = "your-resource-group";
    const logicAppName = "MyLogicApp";
    const location = "eastus";

    const credential = new DefaultAzureCredential();
    const client = new LogicManagementClient(credential, subscriptionId);

    const parameters = {
        location: location,
        definition: {
            "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowDefinition.json",
            "actions": {
                "Send_Email": {
                    "inputs": {
                        "host": {
                            "connection": {
                                "name": "@parameters('$connections')['office365']['connectionId']"
                            }
                        },
                        "method": "post",
                        "path": "/v2/Mail",
                        "body": {
                            "To": "your-email@example.com",
                            "Subject": "New RSS Feed Item: @{triggerBody()?['title']}",
                            "Body": "<p>Title: @{triggerBody()?['title']}</p><p>Link: <a href='@{triggerBody()?['link']}'>Read More</a></p>",
                            "Importance": "Normal"
                        }
                    },
                    "runAfter": {
                        "Check_RSS_Feed": ["Succeeded"]
                    },
                    "type": "ApiConnection"
                }
            },
            "triggers": {
                "Check_RSS_Feed": {
                    "inputs": {
                        "host": {
                            "connection": {
                                "name": "@parameters('$connections')['rss']['connectionId']"
                            }
                        },
                        "method": "get",
                        "path": "/v2/items",
                        "query": {
                            "feedUrl": "https://example.com/rss"
                        }
                    },
                    "type": "ApiConnection"
                }
            }
        }
    };

    try {
        const result = await client.workflows.beginCreateOrUpdate(resourceGroupName, logicAppName, parameters);
        console.log("Logic App created successfully:", result);
    } catch (error) {
        console.error("Error creating Logic App:", error);
    }
}

createLogicApp();