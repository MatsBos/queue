import { SalvoGroup } from './salvo-group';
import { SourceItem } from './source-item';

export interface SalvoItem {
  id?: number;
  sourceItemId: number;
  salvoGroupId?: number;
  order?: number;
  done: boolean;
  sourceItem?: SourceItem;
  salvoGroup?: SalvoGroup;
}
