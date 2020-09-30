export interface Unit {
  id?: number;
  name: string;
  level?: number;
}

export interface UnitsTree {
  id?: number;
  name: string;
  level: number;
  units?: UnitsTree[];
  parent?: UnitsTree;
  active?: boolean;
  checked?: boolean;
}
