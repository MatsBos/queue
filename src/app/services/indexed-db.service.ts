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

  deleteSourceItem(id: number): void {
    db.sourceList.delete(id);

    db.salvoList.where('sourceItemId').equals(id).delete();
  }

  updateSourceItem(id: number, updates: Partial<SourceItem>): void {
    db.sourceList.update(id, updates);
  }

  async getSalvoItems(): Promise<SalvoItem[]> {
    await this.normalizeOrder();

    return db.salvoList.orderBy('order').toArray();
  }

  async addSalvoItem(item: SalvoItem): Promise<number> {
    return await db.salvoList.add(item);
  }

  updateSalvoItem(id: number, updates: Partial<SalvoItem>): void {
    db.salvoList.update(id, updates);
  }

  deleteSalvoItem(id: number): void {
    db.salvoList.delete(id);
  }

  // ───── Foreign Key Helper ─────
  async getSalvoItemsWithSource(): Promise<SalvoItem[]> {
    const salvos = await this.getSalvoItems();

    // Manually join with related SourceItem
    return Promise.all(
      salvos.map(async (salvo) => {
        const sourceItem = await db.sourceList.get(salvo.sourceItemId);
        return { ...salvo, sourceItem };
      })
    );
  }

  private async normalizeOrder(): Promise<void> {
    await db.transaction('rw', db.salvoList, async () => {
      (await db.salvoList.orderBy('order').toArray()).forEach((item, index) => {
        db.salvoList.update(item.id!, { order: index });
      });
    });
  }
}
