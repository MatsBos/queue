import { SourceItem } from './source-item';

export interface SalvoItem {
  id?: number;
  sourceItemId: number;
  order?: number;
  sourceItem?: SourceItem;
  done: boolean;
}
