import { Injectable } from '@angular/core';
import { db } from '../database/db';
import { SourceItem } from '../interfaces/source-item';
import { SalvoItem } from '../interfaces/salvo-item';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  addSourceItem(item: SourceItem): void {
    db.sourceList.add(item);
  }

  getSourceItems(): Promise<SourceItem[]> {
    return db.sourceList.toArray();
  }

  async deleteSourceItem(id: number): Promise<void> {
    await db.sourceList.delete(id);

    await db.salvoList.where('sourceItemId').equals(id).delete();

    this.updateSalvoItemOrder(await this.getSalvoItems());
  }

  updateSourceItem(id: number, updates: Partial<SourceItem>): void {
    db.sourceList.update(id, updates);
  }

  async getSalvoItems(): Promise<SalvoItem[]> {
    return await db.salvoList.orderBy('order').toArray();
  }

  async getSalvoItem(id: number): Promise<SalvoItem | undefined> {
    return await db.salvoList.get(id);
  }

  async addSalvoItem(item: SalvoItem): Promise<number> {
    return await db.salvoList.add(item);
  }

  async deleteSalvoItem(id: number): Promise<void> {
    await db.salvoList.delete(id);

    this.updateSalvoItemOrder(await this.getSalvoItems());
  }

  updateSalvoItem(id: number, updates: Partial<SalvoItem>): void {
    db.salvoList.update(id, updates);
  }

  async updateSalvoItemOrder(items: SalvoItem[]): Promise<void> {
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    })) as SalvoItem[];

    await db.transaction('rw', db.salvoList, async () => {
      for (const item of updatedItems) {
        await db.salvoList.update(item.id!, { order: item.order });
      }
    });
  }

  // ───── Foreign Key Helper ─────
  // async getSalvoItemsWithSource(): Promise<SalvoItem[]> {
  //   const salvos = await this.getSalvoItems();

  //   // Manually join with related SourceItem
  //   return Promise.all(
  //     salvos.map(async (salvo) => {
  //       const sourceItem = await db.sourceList.get(salvo.sourceItemId);
  //       return { ...salvo, sourceItem };
  //     })
  //   );
  // }
}
