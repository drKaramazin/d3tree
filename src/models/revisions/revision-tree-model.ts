import { User } from '@models/user';

export interface RevisionTreeData {
  created_by: User;
  executor: User;
  created_at: string;
  updated_at: string;
  copy_of: number;
}

export interface RevisionTreeModel {
  id: number;
  name: string;
  value?: RevisionTreeData;
  children?: RevisionTreeModel[];
  x?: any;
  y?: any;
}

export const enum Direction {
  TOP_BOTTOM = 'top-bottom',
  RIGHT_LEFT = 'right-left',
  BOTTOM_TOP = 'bottom-top',
  LEFT_RIGHT = 'left-right',
}

export const enum Type {
  TREE = 'tree',
  CLUSTER = 'cluster',
}

export const enum LinkType {
  LINES = 'lines',
  CURVES = 'curves',
}
