import { describe, expect, test } from "bun:test";

globalThis.localStorage = {
    length: 0,
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
} as Storage;

const { defaultConfig } = await import("@/stores/use-config-store");
const { buildKokoVideoRequest, buildSeedanceVideoRequest } = await import("./video");

describe("Seedance per-task request", () => {
    test("uses the documented JSON fields and fixes the cheapest model to 10 seconds", () => {
        expect(
            buildSeedanceVideoRequest({ ...defaultConfig, videoSeconds: "6", size: "1280x720" }, "seedance-2.0-fast-720p-c5", "海边日落", [
                { id: "1", name: "reference", type: "image/png", dataUrl: "data:image/png;base64,abc", url: "https://cdn.example.com/reference.png" },
            ]),
        ).toEqual({
            model: "seedance-2.0-fast-720p-c5",
            prompt: "海边日落",
            duration: 10,
            aspect_ratio: "16:9",
            image_url: "https://cdn.example.com/reference.png",
        });
    });

    test("rejects local-only reference media", () => {
        expect(() => buildSeedanceVideoRequest({ ...defaultConfig, videoSeconds: "10", size: "16:9" }, "seedance-2.0-fast-720p-c5", "测试", [{ id: "1", name: "local", type: "image/png", dataUrl: "data:image/png;base64,abc" }])).toThrow();
    });
});

describe("KOKO video request", () => {
    test.each([
        ["seedance-2.0", "6", 15, "720p"],
        ["seedance-2.5", "30", 30, "720p"],
        ["minimaxh3", "4", 4, "2K"],
    ] as const)("normalizes %s to its supported duration and fixed resolution", (model: string, requested: string, duration: number, resolution: string) => {
        expect(buildKokoVideoRequest({ ...defaultConfig, videoSeconds: requested, size: "16:9" }, model, "测试视频")).toEqual({
            model,
            prompt: "测试视频",
            duration,
            ratio: "16:9",
            resolution,
            mode: "text-to-video",
            count: 1,
        });
    });

    test("uses first-frame mode and the documented reference image field", () => {
        expect(
            buildKokoVideoRequest({ ...defaultConfig, videoSeconds: "14", size: "9:16", videoMode: "frames" }, "seedance-2.5", "人物转身", [{ id: "1", name: "reference", type: "image/png", dataUrl: "", url: "https://cdn.example.com/reference.png" }]),
        ).toEqual({
            model: "seedance-2.5",
            prompt: "人物转身",
            duration: 14,
            ratio: "9:16",
            resolution: "720p",
            mode: "first-frame",
            count: 1,
            reference_images: [{ url: "https://cdn.example.com/reference.png" }],
        });
    });
});
