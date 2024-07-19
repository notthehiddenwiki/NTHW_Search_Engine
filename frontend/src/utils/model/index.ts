import { Remote, wrap } from 'comlink';
import ComlinkWorker, { EmbeddingExtractionWorker } from './embedding_extractor.worker';

const saveFile = async (data: string) => {
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'embeddings.json';
  link.href = window.URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  if (link.parentNode) link.parentNode.removeChild(link);
};
function sliceIntoChunks(arr: { id: string; content: string }[], chunkSize: number) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

export class ModelSearcher {
  private worker: Remote<EmbeddingExtractionWorker> | null;

  public isInitialized: boolean;

  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  public async init() {
    const worker: Worker = new ComlinkWorker();
    const WebworkerProcessorApi = wrap<typeof EmbeddingExtractionWorker>(worker);
    this.worker = await new WebworkerProcessorApi();
    await this.worker.init();
    this.isInitialized = true;
  }

  public async search(text: string, filterByTags: number[]): Promise<SearchResult[]> {
    if (!this.worker) throw new Error('you need to initialize ModelSearcher first');
    return this.worker.search(text, filterByTags);
  }
}