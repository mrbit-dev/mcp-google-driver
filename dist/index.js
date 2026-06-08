import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";
import { Readable } from "stream";
dotenv.config({ quiet: true });
const CREDENTIALS_PATH = process.env.CREDENTIALS_PATH || "credentials.json";
const TOKEN_PATH = process.env.TOKEN_PATH || "token.json";
// Initialize Google Drive API Client
function getDriveClient() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Credentials file not found at ${CREDENTIALS_PATH}. Please run the auth script first.`);
    }
    if (!fs.existsSync(TOKEN_PATH)) {
        throw new Error(`Token file not found at ${TOKEN_PATH}. Please run the auth script first.`);
    }
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web || {};
    const redirectUri = redirect_uris ? redirect_uris[0] : "http://localhost";
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);
    oAuth2Client.setCredentials(tokens);
    // Auto-refresh token if it expires
    oAuth2Client.on("tokens", (newTokens) => {
        const currentTokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
        const updatedTokens = { ...currentTokens, ...newTokens };
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedTokens, null, 2));
    });
    return google.drive({ version: "v3", auth: oAuth2Client });
}
// Helper to convert readable stream to string
async function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on("error", (err) => reject(err));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
}
class GoogleDriveMcpServer {
    server;
    drive;
    constructor() {
        this.server = new Server({
            name: "google-drive-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupTools();
        // Error handling
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    initDrive() {
        if (!this.drive) {
            this.drive = getDriveClient();
        }
    }
    setupTools() {
        // 1. List tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "gdrive_list",
                        description: "List files and folders in a specific directory or root folder",
                        inputSchema: {
                            type: "object",
                            properties: {
                                parentId: {
                                    type: "string",
                                    description: "The ID of the parent folder. Use 'root' for the top level directory.",
                                    default: "root"
                                },
                                pageSize: {
                                    type: "number",
                                    description: "Maximum number of files to return",
                                    default: 50
                                }
                            }
                        }
                    },
                    {
                        name: "gdrive_create_folder",
                        description: "Create a new folder in Google Drive",
                        inputSchema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "The name of the new folder"
                                },
                                parentId: {
                                    type: "string",
                                    description: "The ID of the parent folder where the new folder will be created. Defaults to 'root'."
                                }
                            },
                            required: ["name"]
                        }
                    },
                    {
                        name: "gdrive_read_file",
                        description: "Read the content of a Google Drive file as text",
                        inputSchema: {
                            type: "object",
                            properties: {
                                fileId: {
                                    type: "string",
                                    description: "The unique ID of the file to read"
                                }
                            },
                            required: ["fileId"]
                        }
                    },
                    {
                        name: "gdrive_write_file",
                        description: "Create a new text file or overwrite an existing file with content",
                        inputSchema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "The name of the file to create"
                                },
                                content: {
                                    type: "string",
                                    description: "The text content of the file"
                                },
                                parentId: {
                                    type: "string",
                                    description: "The ID of the parent folder. Defaults to 'root'."
                                },
                                mimeType: {
                                    type: "string",
                                    description: "Mime type of the file. Defaults to 'text/plain'. For Google Doc use 'application/vnd.google-apps.document'."
                                }
                            },
                            required: ["name", "content"]
                        }
                    },
                    {
                        name: "gdrive_update_file",
                        description: "Update the content of an existing text file in Google Drive",
                        inputSchema: {
                            type: "object",
                            properties: {
                                fileId: {
                                    type: "string",
                                    description: "The ID of the file to update"
                                },
                                content: {
                                    type: "string",
                                    description: "The new text content to write into the file"
                                }
                            },
                            required: ["fileId", "content"]
                        }
                    },
                    {
                        name: "gdrive_delete_file",
                        description: "Move a file or folder to trash or delete it permanently",
                        inputSchema: {
                            type: "object",
                            properties: {
                                fileId: {
                                    type: "string",
                                    description: "The ID of the file or folder to delete"
                                },
                                useTrash: {
                                    type: "boolean",
                                    description: "If true, moves to trash instead of permanent deletion. Recommended.",
                                    default: true
                                }
                            },
                            required: ["fileId"]
                        }
                    },
                    {
                        name: "gdrive_search",
                        description: "Search for files and folders using Google Drive Query syntax",
                        inputSchema: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "Search query, e.g. \"name contains 'contract'\" or \"mimeType = 'application/vnd.google-apps.folder'\""
                                },
                                pageSize: {
                                    type: "number",
                                    description: "Maximum number of results to return",
                                    default: 50
                                }
                            },
                            required: ["query"]
                        }
                    }
                ]
            };
        });
        // 2. Call tool
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                this.initDrive();
            }
            catch (err) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error initializing Google Drive connection: ${err.message}`
                        }
                    ],
                    isError: true
                };
            }
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "gdrive_list": {
                        const parentId = args?.parentId || "root";
                        const pageSize = args?.pageSize || 50;
                        const response = await this.drive.files.list({
                            q: `'${parentId}' in parents and trashed = false`,
                            fields: "files(id, name, mimeType, modifiedTime, size)",
                            pageSize: pageSize
                        });
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(response.data.files, null, 2)
                                }
                            ]
                        };
                    }
                    case "gdrive_create_folder": {
                        const folderName = args?.name;
                        const parentId = args?.parentId || "root";
                        const fileMetadata = {
                            name: folderName,
                            mimeType: "application/vnd.google-apps.folder",
                            parents: [parentId]
                        };
                        const folder = await this.drive.files.create({
                            requestBody: fileMetadata,
                            fields: "id, name, mimeType"
                        });
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `Folder created successfully: ${JSON.stringify(folder.data, null, 2)}`
                                }
                            ]
                        };
                    }
                    case "gdrive_read_file": {
                        const fileId = args?.fileId;
                        // Fetch file metadata to check if it's a Google Doc
                        const fileMeta = await this.drive.files.get({
                            fileId: fileId,
                            fields: "name, mimeType"
                        });
                        const mimeType = fileMeta.data.mimeType;
                        let fileContent;
                        if (mimeType && mimeType.startsWith("application/vnd.google-apps.")) {
                            // Google Docs/Sheets/Slides need to be exported
                            let exportMimeType = "text/plain";
                            if (mimeType === "application/vnd.google-apps.spreadsheet") {
                                exportMimeType = "text/csv";
                            }
                            const response = await this.drive.files.export({
                                fileId: fileId,
                                mimeType: exportMimeType
                            }, { responseType: "stream" });
                            fileContent = await streamToString(response.data);
                        }
                        else {
                            // Normal binary/text file download
                            const response = await this.drive.files.get({
                                fileId: fileId,
                                alt: "media"
                            }, { responseType: "stream" });
                            fileContent = await streamToString(response.data);
                        }
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: fileContent
                                }
                            ]
                        };
                    }
                    case "gdrive_write_file": {
                        const fileName = args?.name;
                        const content = args?.content;
                        const parentId = args?.parentId || "root";
                        const mimeType = args?.mimeType || "text/plain";
                        const fileMetadata = {
                            name: fileName,
                            parents: [parentId]
                        };
                        if (mimeType !== "text/plain") {
                            fileMetadata.mimeType = mimeType;
                        }
                        const media = {
                            mimeType: "text/plain",
                            body: Readable.from([content])
                        };
                        const file = await this.drive.files.create({
                            requestBody: fileMetadata,
                            media: media,
                            fields: "id, name, mimeType"
                        });
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `File created successfully: ${JSON.stringify(file.data, null, 2)}`
                                }
                            ]
                        };
                    }
                    case "gdrive_update_file": {
                        const fileId = args?.fileId;
                        const content = args?.content;
                        const media = {
                            mimeType: "text/plain",
                            body: Readable.from([content])
                        };
                        const file = await this.drive.files.update({
                            fileId: fileId,
                            media: media,
                            fields: "id, name, mimeType, modifiedTime"
                        });
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: `File updated successfully: ${JSON.stringify(file.data, null, 2)}`
                                }
                            ]
                        };
                    }
                    case "gdrive_delete_file": {
                        const fileId = args?.fileId;
                        const useTrash = args?.useTrash !== false;
                        if (useTrash) {
                            const file = await this.drive.files.update({
                                fileId: fileId,
                                requestBody: { trashed: true }
                            });
                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: `Moved file ${fileId} to trash.`
                                    }
                                ]
                            };
                        }
                        else {
                            await this.drive.files.delete({
                                fileId: fileId
                            });
                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: `Deleted file ${fileId} permanently.`
                                    }
                                ]
                            };
                        }
                    }
                    case "gdrive_search": {
                        const query = args?.query;
                        const pageSize = args?.pageSize || 50;
                        const response = await this.drive.files.list({
                            q: `${query} and trashed = false`,
                            fields: "files(id, name, mimeType, modifiedTime, size)",
                            pageSize: pageSize
                        });
                        return {
                            content: [
                                {
                                    type: "text",
                                    text: JSON.stringify(response.data.files, null, 2)
                                }
                            ]
                        };
                    }
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (err) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Google Drive API error: ${err.message}`
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Google Drive MCP Server running on stdio");
    }
}
const server = new GoogleDriveMcpServer();
server.run().catch(console.error);
