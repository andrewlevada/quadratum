import { OAuthData } from "~services/user";
import { ScopeDocument, ScopeDraft } from "~src/models/scope";

// TODO: Add scope refresh logic
export function generateFigmaOAuthToken(code: string): Promise<OAuthData> {
    return fetch("https://functions.yandexcloud.net/d4egl0rlb1ug96bg0hn0", {
        method: "POST",
        body: JSON.stringify({ code }),
    }).then(res => res.json()).then(data => ({
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        refreshToken: data.refresh_token,
    }) as OAuthData);
}

export function getScopesFromFigma(url: string, token: string): Promise<ScopeDraft[]> {
    return fetch(getFigmaApiUrlFromBoard(url), {
        headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json())
        .then(data => extractScopesFromFigmaDocument(data.document as DocumentNode));
}

function getFigmaApiUrlFromBoard(boardUrl: string): string {
    const boardId = boardUrl.split("/file/").pop()!.split("/")[0];
    return `https://api.figma.com/v1/files/${boardId}`;
}

const emojiRegex = /([\p{Emoji_Presentation}|\p{Extended_Pictographic}\u200d]+)/gu;

type Connection = ConnectorEndpointEndpointNodeIdAndMagnet;
function extractScopesFromFigmaDocument(document: DocumentNode): ScopeDraft[] {
    const page = document.children[0];

    const scopes: Record<string, ScopeDocument> = {};

    for (const node of page.children) {
        if (node.type !== "SHAPE_WITH_TEXT") continue;
        const emojis = node.name.match(emojiRegex);
        scopes[node.id] = {
            label: node.name.replace(emojiRegex, "").replace("/", "").trim(),
            parentIds: [],
        }
        if (node.shapeType === "ROUNDED_RECTANGLE") scopes[node.id].isPinned = true;
        if (emojis && emojis[0]) scopes[node.id].symbol = emojis[0];
    }

    for (const node of page.children) {
        if (node.type !== "CONNECTOR") continue;
        scopes[(node.connectorEnd as Connection)?.endpointNodeId].parentIds
            .push((node.connectorStart as Connection)?.endpointNodeId)
    }

    for (const scope of Object.values(scopes))
        if (scope.parentIds.length === 0) scope.parentIds.push("root");

    return Object.entries(scopes).map(([id, scope]) => ({
        id, ...scope
    }));
}
