import { Asset } from '../models/asset.model';
import { SignedAction } from '../classes/signed-action.interface';
import { Actions } from '../enums/actions.enum';
import { AppState } from '../classes/app-state.interface';

const affects: Array<keyof AppState> = ['workspaces'];

export class SelectedItemsActions {
  static affects = affects;

  static select(id: string, projectCode: string): SignedAction {
    return {
      type: Actions.SELECT_ITEM,
      affects,
      projectCode,
      id
    };
  }

  static deselect(id: string, projectCode: string): SignedAction {
    return {
      type: Actions.DESELECT_ITEM,
      affects,
      projectCode,
      id
    };
  }

  static selectMany(ids: string[], projectCode: string): SignedAction {
    return {
      type: Actions.SELECT_ITEMS,
      affects,
      projectCode,
      ids
    };
  }

  static deselectMany(ids: string[], projectCode: string): SignedAction {
    return {
      type: Actions.DESELECT_ITEMS,
      affects,
      projectCode,
      ids
    };
  }
}
