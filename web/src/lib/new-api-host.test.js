import { describe, expect, test } from "bun:test";

import { NEW_API_CANVAS_CONFIG, parseNewApiCanvasConfig } from "./new-api-host";

describe("parseNewApiCanvasConfig", () => {
    test("accepts a same-origin New API credential message", () => {
        expect(
            parseNewApiCanvasConfig(
                {
                    type: NEW_API_CANVAS_CONFIG,
                    version: 1,
                    baseUrl: "https://api.example.com/v1",
                    apiKey: "sk-image-key",
                    channelName: "图图",
                    historyScope: "user-42",
                },
                "https://api.example.com",
            ),
        ).toEqual({
            type: NEW_API_CANVAS_CONFIG,
            version: 1,
            baseUrl: "https://api.example.com",
            apiKey: "sk-image-key",
            channelName: "图图",
            historyScope: "user-42",
        });
    });

    test("rejects credentials for another origin", () => {
        expect(
            parseNewApiCanvasConfig(
                {
                    type: NEW_API_CANVAS_CONFIG,
                    version: 1,
                    baseUrl: "https://attacker.example/v1",
                    apiKey: "sk-image-key",
                    channelName: "图图",
                    historyScope: "user-42",
                },
                "https://api.example.com",
            ),
        ).toBeNull();
    });

    test("rejects malformed API keys", () => {
        expect(
            parseNewApiCanvasConfig(
                {
                    type: NEW_API_CANVAS_CONFIG,
                    version: 1,
                    baseUrl: "https://api.example.com",
                    apiKey: "image-key",
                    channelName: "图图",
                    historyScope: "user-42",
                },
                "https://api.example.com",
            ),
        ).toBeNull();
    });

    test("rejects a message without the selected API key name", () => {
        expect(
            parseNewApiCanvasConfig(
                {
                    type: NEW_API_CANVAS_CONFIG,
                    version: 1,
                    baseUrl: "https://api.example.com",
                    apiKey: "sk-image-key",
                    historyScope: "user-42",
                },
                "https://api.example.com",
            ),
        ).toBeNull();
    });

    test("rejects an invalid history scope", () => {
        expect(
            parseNewApiCanvasConfig(
                {
                    type: NEW_API_CANVAS_CONFIG,
                    version: 1,
                    baseUrl: "https://api.example.com",
                    apiKey: "sk-image-key",
                    channelName: "图图",
                    historyScope: "../shared",
                },
                "https://api.example.com",
            ),
        ).toBeNull();
    });
});
