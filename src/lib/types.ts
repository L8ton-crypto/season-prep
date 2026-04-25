import type { Season } from "./seasons";

export type Task = {
  id: string;
  year: number;
  season: Season;
  title: string;
  category: string;
  due_month: number | null;
  kid_id: string | null;
  notes: string;
  done: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Kid = {
  id: string;
  name: string;
  born_year: number | null;
  size_top: string;
  size_bottom: string;
  size_shoe: string;
  notes: string;
};
