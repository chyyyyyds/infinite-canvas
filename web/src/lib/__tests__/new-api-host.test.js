import { describe, expect, test } from "bun:test";

globalThis.localStorage = {
    length: 0,
    clear: () => undefined,
    getItem: () => null,
    key: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
};

const { parseNewApiCanvasConfig } = await import("../new-api-host");
const { kokoVideoModelConfig } = await import("../video-model-config");
const { createModelChannel, defaultConfig, modelOptionName, selectableModelsByCapability, useConfigStore, withModelChannels } = await import("@/stores/use-config-store");

const stableHostConfig = {
    type: "new-api:canvas-config",
    version: 1,
    baseUrl: "https://new-api.example.com",
    apiKey: "sk-stable-video",
    channelName: "视频生成（稳定版）",
    historyScope: "user-42",
    studio: "video",
    preferredModel: "seedance-2.5",
    videoSeconds: "14",
    videoResolution: "720",
    videoSize: "16:9",
};

describe("new-api 视频工作台配置", () => {
    test("接受稳定版使用的比例尺寸配置", () => {
        expect(parseNewApiCanvasConfig(stableHostConfig, "https://new-api.example.com")).toEqual(stableHostConfig);
    });

    test("只暴露当前宿主管理渠道的模型并应用对应默认参数", () => {
        const legacyChannel = createModelChannel({
            id: "legacy",
            name: "seedance视频生成",
            baseUrl: "https://new-api.example.com",
            apiKey: "sk-legacy-video",
            models: [{ name: "seedance-2.0-fast-720p-c5", capability: "video" }],
        });
        const managedChannel = createModelChannel({
            id: "managed",
            name: "视频生成（稳定版）",
            baseUrl: "https://new-api.example.com",
            apiKey: "sk-stable-video",
            managedByHost: true,
        });
        useConfigStore.setState({ config: withModelChannels(defaultConfig, [legacyChannel, managedChannel]) });

        useConfigStore.getState().updateChannelModels("managed", ["seedance-2.0", "seedance-2.5", "minimaxh3"], stableHostConfig);

        const config = useConfigStore.getState().config;
        expect(selectableModelsByCapability(config, "video").map(modelOptionName)).toEqual(["seedance-2.0", "seedance-2.5", "minimaxh3"]);
        expect(modelOptionName(config.videoModel)).toBe("seedance-2.5");
        expect(config.vquality).toBe("720");
        expect(config.size).toBe("16:9");
        expect(config.videoSeconds).toBe("14");
    });

    test("使用上游文档声明的清晰度、比例和时长", () => {
        expect(kokoVideoModelConfig("seedance-2.0")).toEqual({ resolution: "720p", durations: [5, 15], defaultDuration: 15, ratios: ["9:16", "1:1", "3:4", "4:3", "16:9"] });
        expect(kokoVideoModelConfig("seedance-2.5")).toEqual({ resolution: "720p", durations: [14, 30], defaultDuration: 14, ratios: ["9:16", "1:1", "3:4", "4:3", "16:9"] });
        expect(kokoVideoModelConfig("minimaxh3")).toEqual({ resolution: "2K", durations: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], defaultDuration: 15, ratios: ["9:16", "1:1", "3:4", "4:3", "16:9"] });
    });
});
