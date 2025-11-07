-- Add category column to listings table
ALTER TABLE listings ADD COLUMN category TEXT NOT NULL DEFAULT 'Other';

-- Create index for faster filtering
CREATE INDEX idx_listings_category ON listings(category);

-- Insert demo listings (one for each category)
INSERT INTO listings (title, description, price, location, seller_name, seller_phone, image_url, category) VALUES
('iPhone 13 Pro Max 256GB', 'Barely used iPhone 13 Pro Max in excellent condition. Comes with original box and charger. No scratches, battery health 98%. Serious buyers only.', 280000, 'Lekki, Lagos', 'Chidi Okafor', '08012345678', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop', 'Electronics'),

('Honda Accord 2015', 'Clean Honda Accord 2015 model. Very neat interior and exterior. AC chilling, perfect engine. First body. Buy and drive. No fault.', 3500000, 'Ikeja, Lagos', 'Bola Ahmed', '08023456789', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop', 'Vehicles'),

('3 Bedroom Flat for Rent', 'Spacious 3 bedroom flat in a serene estate. All rooms ensuite, pop ceiling, modern kitchen, ample parking. Very secure area.', 1200000, 'Ajah, Lagos', 'Mrs. Adeyemi', '08034567890', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop', 'Real Estate'),

('Office Chair - Ergonomic', 'High quality ergonomic office chair. Adjustable height, lumbar support, mesh back. Very comfortable for long hours. Like new condition.', 45000, 'Surulere, Lagos', 'Emeka Nwankwo', '08045678901', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&auto=format&fit=crop', 'Furniture'),

('Aso-Ebi Lace Material', 'Beautiful French lace for aso-ebi. 5 yards per pack. Available in multiple colors: royal blue, wine, champagne gold. Quality guaranteed.', 28000, 'Yaba, Lagos', 'Fatima Ibrahim', '08056789012', 'https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=800&auto=format&fit=crop', 'Fashion'),

('Canon EOS 90D DSLR Camera', 'Professional Canon 90D with 18-135mm lens. Barely used, only 2000 shutter count. Includes camera bag, extra battery, and 64GB SD card.', 520000, 'Victoria Island, Lagos', 'David Okonkwo', '08067890123', 'https://images.unsplash.com/photo-1606980707146-b3a0e1a8e1c3?w=800&auto=format&fit=crop', 'Electronics'),

('Kids Bunk Bed', 'Solid wood bunk bed for kids. Sturdy construction, includes mattresses. Good condition, no damage. Perfect for siblings sharing a room.', 75000, 'Gbagada, Lagos', 'Grace Michael', '08078901234', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop', 'Furniture'),

('Toyota Camry 2018', 'Super clean Toyota Camry 2018. Full option with leather seats, reverse camera, factory AC. Just 4 months used. Accident free.', 8500000, 'Ikoyi, Lagos', 'Ade Johnson', '08089012345', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop', 'Vehicles'),

('Nike Air Max Sneakers', 'Original Nike Air Max sneakers, size 43. Brand new in box with tags. Bought from official store. Perfect for sports and casual wear.', 42000, 'Ikeja, Lagos', 'Daniel Eze', '08090123456', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop', 'Fashion'),

('Home Theatre System', 'Sony 5.1 channel home theatre system with powerful subwoofer. Excellent sound quality. All speakers working perfectly. Complete set.', 95000, 'Festac, Lagos', 'Samuel Adebayo', '08001234567', 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop', 'Electronics');
