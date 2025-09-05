export interface Category {
  name: string;
  description: string;
  category_id: number;
  extra_persons_allowed: boolean;
  no_of_people_allowed: number | null;
  create_date: string;
  is_active: boolean;
  created_by: string | null;
}