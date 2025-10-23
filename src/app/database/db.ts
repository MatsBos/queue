import Dexie, { Table } from 'dexie';
import { SourceItem } from '../interfaces/source-item';
import { SalvoItem } from '../interfaces/salvo-item';
import { SalvoGroup } from '../interfaces/salvo-group';

export class AppDB extends Dexie {
  sourceList!: Table<SourceItem, number>;
  salvoGroupList!: Table<SalvoGroup, number>;
  salvoList!: Table<SalvoItem, number>;

  constructor() {
    super('queueDB');
    this.version(3.1).stores({
      sourceList: '++id',
      salvoGroupList: '++id',
      salvoList: '++id, sourceItemId, order',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    await db.sourceList.bulkAdd([
      {
        name: 'LSM Gold',
        colorHex: '#FFD700',
      },
      {
        name: 'LSM White',
        colorHex: '#FFFFFF',
      },
      {
        name: 'LSM Red',
        colorHex: '#FF0000',
      },
      {
        name: 'LSM Gray',
        colorHex: '#808080',
      },
    ]);
  }
}

export const db = new AppDB();
