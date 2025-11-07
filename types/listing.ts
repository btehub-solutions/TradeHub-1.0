export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  seller_name: string;
  seller_phone: string;
  image_url?: string;
  created_at: string;
}

export interface NewListing {
  title: string;
  description: string;
  price: number;
  location: string;
  seller_name: string;
  seller_phone: string;
  image_url?: string;
}
