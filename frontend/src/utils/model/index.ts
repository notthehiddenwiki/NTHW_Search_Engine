import { Remote, wrap } from 'comlink';
import ComlinkWorker, { EmbeddingExtractionWorker } from './embedding_extractor.worker';

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