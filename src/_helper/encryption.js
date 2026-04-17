const SECRET_KEY = "TICKET_SECRET_2024";

export const encryptTicketId = (ticketId) => {
    try {
        const str = String(ticketId);
        const encoded = btoa(
            str
                .split("")
                .map((c, i) =>
                    String.fromCharCode(
                        c.charCodeAt(0) ^
                            SECRET_KEY.charCodeAt(i % SECRET_KEY.length),
                    ),
                )
                .join(""),
        );
        return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    } catch {
        return btoa(String(ticketId));
    }
};

export const decryptTicketId = (encrypted) => {
    try {
        const base64 = encrypted
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(
                encrypted.length + ((4 - (encrypted.length % 4)) % 4),
                "=",
            );
        const decoded = atob(base64);
        return decoded
            .split("")
            .map((c, i) =>
                String.fromCharCode(
                    c.charCodeAt(0) ^
                        SECRET_KEY.charCodeAt(i % SECRET_KEY.length),
                ),
            )
            .join("");
    } catch {
        try {
            return atob(encrypted);
        } catch {
            return encrypted;
        }
    }
};
