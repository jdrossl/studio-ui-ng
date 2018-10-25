import { AppState } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { Actions } from '../enums/actions.enum';

const affects: Array<keyof AppState> = ['workspaces'];

export class ExpandedPathsActions {
  static affects = affects;

  static expand(key: string): SignedAction {
    return { type: Actions.EXPAND_PATH, affects, key };
  }

  static collapse(key: string): SignedAction {
    return { type: Actions.COLLAPSE_PATH, affects, key };
  }

  static expandMany(keys: Array<string>): SignedAction {
    return { type: Actions.EXPAND_PATHS, affects, keys };
  }

  static collapseMany(keys: Array<string>): SignedAction {
    return { type: Actions.COLLAPSE_PATHS, affects, keys };
  }
}
