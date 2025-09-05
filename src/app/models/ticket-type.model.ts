export interface TicketType {
  type_id: number;
  category_id: number;
  category_name: string;
  offering_id: number;
  offering_name: string;
  unit_price: number;
  extra_price_per_person: number;
  create_date: string;
  is_active: boolean;
  no_of_tickets: number;
  created_by: string | null;
}
