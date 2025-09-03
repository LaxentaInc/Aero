// /pages/api/bot/route.ts - ONE FILE FOR ALL BOT COMMUNICATION
import { getServerSession } from "next-auth/next";
import { WebSocket } from "ws";

// Simple request queue
type PendingRequest = {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
};
const pendingRequests = new Map<number, PendingRequest>();
let botSocket: WebSocket | null = null;
let reconnectAttempts = 0;

// Connect to bot's WebSocket
function connectToBot() {
    try {
        botSocket = new WebSocket("wss://your-backend-domain.com/ws");

        botSocket.on("open", () => {
            console.log("🤖 Bot connected");
            reconnectAttempts = 0;
        });

        botSocket.on("message", (data: WebSocket.RawData) => {
            try {
                const response = JSON.parse(data.toString());
                if (pendingRequests.has(response.requestId)) {
                    const { resolve } = pendingRequests.get(
                        response.requestId
                    ) as PendingRequest;
                    resolve(response);
                    pendingRequests.delete(response.requestId);
                }
            } catch (e) {
                console.error("Failed to parse bot response:", e);
            }
        });

        botSocket.on("close", () => {
            console.log("🔌 Bot disconnected, attempting reconnect...");
            if (reconnectAttempts < 5) {
                setTimeout(() => {
                    reconnectAttempts++;
                    connectToBot();
                }, 3000);
            }
        });
    } catch (error: any) {
        console.error("Bot connection failed:", error);
    }
}

// Send request to bot and wait for response
async function askBot(
    type: string,
    data: Record<string, unknown>,
    timeout = 5000
): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!botSocket || botSocket.readyState !== WebSocket.OPEN) {
            reject(new Error("Bot not connected"));
            return;
        }

        const requestId = Date.now() + Math.random();
        pendingRequests.set(requestId, { resolve, reject });

        botSocket.send(JSON.stringify({ requestId, type, data }));

        setTimeout(() => {
            if (pendingRequests.has(requestId)) {
                pendingRequests.delete(requestId);
                reject(new Error("Bot timeout"));
            }
        }, timeout);
    });
}

// Initialize connection
connectToBot();

// API HANDLERS
export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    try {
        switch (action) {
            case "guilds": {
                const guilds = await askBot("get_valid_guilds", {
                    userId: session.user.id,
                });
                return Response.json(guilds);
            }
            case "module_status": {
                const guildId = searchParams.get("guildId");
                const moduleId = searchParams.get("moduleId");
                const status = await askBot("get_module_status", {
                    guildId,
                    moduleId,
                });
                return Response.json(status);
            }
            default:
                return Response.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session)
        return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action, guildId, moduleId, config } = body;

    try {
        switch (action) {
            case "toggle_module": {
                const result = await askBot("toggle_module", {
                    guildId,
                    moduleId,
                    enabled: config.enabled,
                    userId: session.user.id,
                });
                return Response.json(result);
            }
            case "update_config": {
                const configResult = await askBot("update_config", {
                    guildId,
                    moduleId,
                    config,
                    userId: session.user.id,
                });
                return Response.json(configResult);
            }
            case "update_trusted": {
                const trustedResult = await askBot("update_trusted_global", {
                    guildId,
                    trustedUsers: config.trustedUsers,
                    trustedRoles: config.trustedRoles,
                    userId: session.user.id,
                });
                return Response.json(trustedResult);
            }
            default:
                return Response.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
