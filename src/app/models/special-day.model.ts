export interface SpecialDay {
  date: string;
  name: string;
  description?: string;
  price_modifier: number;
  status: boolean;
}

export interface CreateSpecialDayRequest {
  date: string;
  name: string;
  description?: string;
  price_modifier: number;
}

export interface UpdateSpecialDayRequest {
  name?: string;
  description?: string;
  price_modifier?: number;
}