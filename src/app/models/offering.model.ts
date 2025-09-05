export interface Offering {
  name: string;
  description: string;
  offering_id: number;
  create_date: string;
  is_active: boolean;
  created_by: string | null;
}