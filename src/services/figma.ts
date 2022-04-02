import { OAuthData } from "~src/models/user-service";

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
