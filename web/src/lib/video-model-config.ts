export type VideoModelConfig = {
    resolution: "720p" | "2K";
    durations: readonly number[];
    defaultDuration: number;
    ratios: readonly string[];
};

export const KOKO_VIDEO_RATIOS = ["9:16", "1:1", "3:4", "4:3", "16:9"] as const;

const kokoVideoModels: Record<string, VideoModelConfig> = {
    "seedance-2.0": { resolution: "720p", durations: [5, 15], defaultDuration: 15, ratios: KOKO_VIDEO_RATIOS },
    "seedance-2.5": { resolution: "720p", durations: [14, 30], defaultDuration: 14, ratios: KOKO_VIDEO_RATIOS },
    minimaxh3: { resolution: "2K", durations: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], defaultDuration: 15, ratios: KOKO_VIDEO_RATIOS },
};

/** 返回 KOKO 模型的固定参数范围；其他模型继续沿用通用视频配置。 */
export function kokoVideoModelConfig(model: string): VideoModelConfig | null {
    return kokoVideoModels[model.trim().toLowerCase()] || null;
}

export function videoResolutionPixels(resolution: VideoModelConfig["resolution"]): string {
    return resolution === "2K" ? "2048" : "720";
}

export function normalizeKokoVideoDuration(model: string, value: string): string {
    const config = kokoVideoModelConfig(model);
    if (!config) return value;
    const duration = Math.round(Number(value));
    return String(config.durations.includes(duration) ? duration : config.defaultDuration);
}
