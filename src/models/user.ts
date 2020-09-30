import { Unit } from '@models/unit';
import { Locality } from '@models/locality';

export interface User {
  id: number;
  name: string;
  surname: string;
  second_name: string;
  mail: string;
  is_admin: boolean;
  active: boolean;
  avatar?: string;
  unit?: Unit;
  locality_id?: number;
  locality_expanded?: Locality;
  show_hints: boolean;
  forbid_files_download?: boolean;
}
