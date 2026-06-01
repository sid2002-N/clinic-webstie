import { env } from "../lib/config";

export interface HuggingFaceItem {
  id: string;
  type: "model" | "space" | "dataset";
  likes: number;
  downloads?: number;
  updatedAt?: string;
}

interface HfApiItem {
  id: string;
  likes?: number;
  downloads?: number;
  lastModified?: string;
}

async function fetchCollection(type: HuggingFaceItem["type"], path: string): Promise<HuggingFaceItem[]> {
  const response = await fetch(`https://huggingface.co/api/${path}?author=${encodeURIComponent(env.huggingFaceUsername)}&limit=8`);
  if (!response.ok) throw new Error(`Hugging Face ${type} request returned ${response.status}`);
  const payload = (await response.json()) as HfApiItem[];
  return payload.map((item) => ({
    id: item.id,
    type,
    likes: item.likes || 0,
    downloads: item.downloads,
    updatedAt: item.lastModified,
  }));
}

export async function fetchHuggingFaceLab(): Promise<HuggingFaceItem[]> {
  if (!env.huggingFaceUsername) {
    throw new Error("Hugging Face username missing. Add VITE_HF_USERNAME to enable the lab feed.");
  }

  const [models, spaces, datasets] = await Promise.all([
    fetchCollection("model", "models"),
    fetchCollection("space", "spaces"),
    fetchCollection("dataset", "datasets"),
  ]);

  return [...models, ...spaces, ...datasets].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 8);
}
