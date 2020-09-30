import { User } from '../user';

export interface Revision {
  id: number;
  title: string;
  created_by: User;
  executor: User;
  reason: any;
  revisions: Revision[];
  created_at: string;
  updated_at: string;
  copy_of: number;
}
