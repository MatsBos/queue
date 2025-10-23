import Dexie, { Table } from 'dexie';
import { SourceItem } from '../interfaces/source-item';
import { SalvoItem } from '../interfaces/salvo-item';

export class AppDB extends Dexie {
  sourceList!: Table<SourceItem, number>;
  salvoList!: Table<SalvoItem, number>;

  constructor() {
    super('queueDB');
    this.version(3.1).stores({
      sourceList: '++id',
      salvoList: '++id, sourceItemId, order',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {}
}

export const db = new AppDB();
