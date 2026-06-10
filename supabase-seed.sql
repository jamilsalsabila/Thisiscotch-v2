-- ============================================================
--  Cotch v2 — Supabase Seed Data
--  Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 0. Gallery items (foto suasana cafe untuk halaman Home)
DELETE FROM gallery_items;
INSERT INTO gallery_items (src, alt_id, alt_en, section, sort_order, is_active) VALUES
('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80', 'Area duduk indoor yang nyaman', 'Cozy indoor seating area', 'indoor', 1, true),
('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', 'Suasana kafe yang hangat', 'Warm cafe ambiance', 'indoor', 2, true),
('https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80', 'Teras semi-outdoor', 'Semi-outdoor terrace', 'outdoor', 3, true),
('https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80', 'Minuman signature kami', 'Our signature drinks', 'indoor', 4, true),
('https://images.unsplash.com/photo-1507914997893-4dcfcb6d1af8?w=800&q=80', 'Barista sedang bekerja', 'Barista at work', 'indoor', 5, true),
('https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80', 'Area taman outdoor yang asri', 'Lush outdoor garden area', 'outdoor', 6, true),
('https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80', 'Keahlian meracik kopi', 'Coffee craftsmanship', 'indoor', 7, true),
('https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80', 'Suasana malam hari', 'Evening atmosphere', 'outdoor', 8, true);

-- 1. Hapus data menu lama (jika ada)
DELETE FROM menu_items;

-- 2. Insert semua menu items dari database lama
INSERT INTO menu_items (name_en, name_id, description_en, description_id, category, subcategory, price, image, is_available, is_featured, sort_order) VALUES

-- ── Coffee Signatures ──────────────────────────────────────
('Caffè Latte','Caffè Latte','Espresso blended with fresh milk.','Espresso yang dipadukan dengan susu segar.','coffee-signatures','coffee classic',30000,'/assets/images/menu/menu_737f743a0b42.png',true,false,1),
('Americano','Americano','Freshly brewed black coffee, clean and grounded.','Kopi hitam yang baru diseduh, bersih dan berkarakter.','coffee-signatures','coffee classic',24000,'/assets/images/menu/menu_3cbc11e19b75.png',true,false,2),
('Espresso','Espresso','Single shot espresso, dark and concentrated.','Single shot espresso dengan rasa pekat dan karakter yang bold.','coffee-signatures','coffee classic',20000,'/assets/images/menu/menu_6a111f76c7010.webp',true,false,3),
('Cappuccino','Cappuccino','Espresso with warm milk and soft foam.','Espresso dengan susu hangat dan foam lembut.','coffee-signatures','coffee classic',30000,'/assets/images/menu/menu_6f4b5bff99ca.png',true,false,9),
('Magic','Magic','Strong espresso blended with silky steamed milk.','Espresso kuat yang dipadukan dengan susu steamed yang silky.','coffee-signatures','coffee classic',32000,'/assets/images/menu/menu_3105197dc608.png',true,true,10),
('Berrycano Signature','Berrycano Signature','Espresso infused with mixed berries and sparkling tonic.','Espresso dipadukan dengan mixed berries dan sparkling tonic yang menyegarkan.','coffee-signatures','cotch signature',46000,'/assets/images/menu/menu_6a111ed52f5aa.webp',true,true,4),
('Smoked Hojicha Cream','Smoked Hojicha Cream','Roasted hojicha tea topped with smoky creamy foam.','Teh hojicha panggang dengan creamy foam beraroma smoky di atasnya.','coffee-signatures','cotch signature',46000,NULL,true,true,5),
('Sunset Pandan Spark','Sunset Pandan Spark','Sparkling pandan drink infused with citrus and tropical sweetness.','Minuman sparkling pandan dengan sentuhan citrus dan rasa manis yang segar.','coffee-signatures','cotch signature',38000,'/assets/images/menu/menu_6a110f1f7aacf.webp',true,true,6),
('Cotch Tonic Aren','Cotch Tonic Aren','Espresso mixed with tonic water and palm sugar syrup.','Espresso yang dipadukan dengan tonic water dan sirup gula aren.','coffee-signatures','cotch signature',38000,'/assets/images/menu/menu_6a110e26592b0.webp',true,true,7),
('Pandan Cloud Latte','Pandan Cloud Latte','Espresso blended with pandan milk and creamy cloud foam.','Espresso yang dipadukan dengan susu pandan dan creamy cloud foam yang lembut.','coffee-signatures','cotch signature',35500,'/assets/images/menu/menu_6a1104ba70e39.webp',true,true,8),
('Demerara Latte','Demerara Latte','Espresso blended with caramelized sugar and silky steamed milk.','Espresso yang dipadukan dengan gula karamel dan susu steamed yang silky.','coffee-signatures','coffee signature',34000,NULL,true,false,11),
('Panda Latte','Panda Latte','Espresso blended with pandan milk and silky foam.','Espresso yang dipadukan dengan susu pandan dan foam lembut yang silky.','coffee-signatures','coffee signature',36000,'/assets/images/menu/menu_d9932e182163.png',true,true,12),
('Sea Salt Latte','Sea Salt Latte','Espresso blended with creamy milk and sea salt foam.','Espresso yang dipadukan dengan susu creamy dan foam sea salt yang lembut.','coffee-signatures','coffee signature',38000,NULL,true,false,13),
('Yuzu Spark Americano','Yuzu Spark Americano','Americano infused with Japanese citrus and sparkling tonic.','Americano dengan sentuhan citrus khas Jepang dan sparkling tonic.','coffee-signatures','coffee signature',38000,'/assets/images/menu/menu_0acbbd96a207.png',true,true,14),
('Biscoff Caramel Latte','Biscoff Caramel Latte','Espresso blended with caramel milk and crunchy Biscoff cream.','Espresso yang dipadukan dengan susu karamel dan krim Biscoff yang crunchy.','coffee-signatures','coffee signature',40000,NULL,true,false,15),
('Golden Butterscotch Macchiato','Golden Butterscotch Macchiato','Espresso layered with caramel butter cream and fresh milk.','Espresso berlapis dengan caramel butter cream dan susu segar.','coffee-signatures','coffee signature',42000,'/assets/images/menu/menu_50edd9dc2a53.png',true,true,16),
('Vanilla Drift','Vanilla Drift','Espresso blended with vanilla cream and silky milk.','Espresso yang dipadukan dengan vanilla cream dan susu yang silky.','coffee-signatures','coffee signature',44000,NULL,true,false,17),

-- ── Tea Collection ─────────────────────────────────────────
('Morning Black Tea','Morning Black Tea','Premium black tea with a bold aroma and smooth finish.','Teh hitam premium dengan aroma yang kuat dan akhir rasa yang halus.','tea-collection','artisan tea',22000,NULL,true,false,18),
('Jasmine Bloom Tea','Jasmine Bloom Tea','Fragrant jasmine tea with a delicate floral aroma.','Teh melati yang harum dengan aroma bunga yang lembut.','tea-collection','artisan tea',22000,NULL,true,false,19),
('Oolong Flow','Oolong Flow','Smooth roasted tea with a rich aroma and mellow finish.','Teh panggang yang halus dengan aroma kaya dan aftertaste yang lembut.','tea-collection','artisan tea',24000,NULL,true,false,20),
('Calm Chamomile Tea','Calm Chamomile Tea','Soothing herbal tea with a gentle floral aroma.','Teh herbal yang menenangkan dengan aroma bunga yang lembut.','tea-collection','artisan tea',34000,NULL,true,false,21),
('Lemon Splash Tea','Lemon Splash Tea','Refreshing tea infused with fresh lemon flavor.','Teh menyegarkan dengan sentuhan rasa lemon segar.','tea-collection','flavored tea',28000,'/assets/images/menu/menu_443a3ec8dcba.png',true,true,22),
('Lychee Breeze','Lychee Breeze','Refreshing tea infused with sweet lychee flavor.','Teh menyegarkan dengan sentuhan rasa leci yang manis.','tea-collection','flavored tea',30000,'/assets/images/menu/menu_7f7e270126af.png',true,false,23),
('Peach Chill','Peach Chill','Refreshing tea infused with juicy peach flavor.','Teh menyegarkan dengan sentuhan rasa peach yang juicy.','tea-collection','flavored tea',32000,'/assets/images/menu/menu_aeaf9da5ee27.png',true,false,24),
('Strawberry Wave','Strawberry Wave','Refreshing tea infused with sweet strawberry flavor.','Teh menyegarkan dengan sentuhan rasa stroberi yang manis.','tea-collection','flavored tea',33000,'/assets/images/menu/menu_0fe28ae9e7d1.png',true,false,25),
('Pure Sencha','Pure Sencha','Japanese green tea with a fresh and smooth taste.','Teh hijau Jepang dengan rasa yang segar dan lembut.','tea-collection','japanese tea',28000,NULL,true,false,26),
('Roasted Hojicha','Roasted Hojicha','Roasted Japanese tea with a warm and smoky aroma.','Teh panggang khas Jepang dengan aroma hangat dan smoky.','tea-collection','japanese tea',34000,NULL,true,false,27),
('Matcha Cloud','Matcha Cloud','Premium matcha blended with creamy milk foam.','Matcha premium yang dipadukan dengan foam susu creamy.','tea-collection','japanese tea',36000,'/assets/images/menu/menu_a39cad699d23.png',true,false,28),

-- ── Refreshing ─────────────────────────────────────────────
('Avocado Velvet','Avocado Velvet','Creamy avocado smoothie with smooth, rich texture.','Smoothie alpukat creamy dengan tekstur yang lembut dan kaya rasa.','refreshing','smoothie',34000,NULL,true,false,29),
('Mango Rush','Mango Rush','Refreshing mango smoothie with a sweet tropical flavor.','Smoothie mangga yang menyegarkan dengan rasa manis tropis.','refreshing','smoothie',34000,NULL,true,false,30),
('Strawberry Swirl','Strawberry Swirl','Creamy strawberry smoothie with a sweet fruity blend.','Smoothie stroberi creamy dengan perpaduan rasa buah yang manis.','refreshing','smoothie',34000,'/assets/images/menu/menu_5e6615d987c8.png',true,true,31),
('Berry Banana Blend','Berry Banana Blend','Creamy smoothie blended with berries and ripe banana for a sweet, fruity taste.','Smoothie creamy yang dipadukan dengan berries dan pisang matang untuk rasa buah yang manis.','refreshing','smoothie',38000,NULL,true,false,32),
('Watermelon Cool','Watermelon Cool','Refreshing watermelon juice with a naturally sweet and cooling taste.','Jus semangka yang menyegarkan dengan rasa manis alami dan sensasi dingin.','refreshing','fresh juice',28000,'/assets/images/menu/menu_ad85b0d01729.png',true,false,33),
('Mango Fresh','Mango Fresh','Fresh mango juice with a sweet and tropical flavor.','Jus mangga segar dengan rasa manis dan sentuhan tropis.','refreshing','fresh juice',32000,'/assets/images/menu/menu_a53f81e40b30.png',true,false,34),
('Pineapple Chill','Pineapple Chill','Refreshing pineapple juice with a sweet and tangy tropical taste.','Jus nanas yang menyegarkan dengan rasa manis dan asam khas tropis.','refreshing','fresh juice',33000,'/assets/images/menu/menu_77ac191e8871.png',true,false,35),
('Avocado Calm','Avocado Calm','Creamy avocado juice with a smooth and mild natural taste.','Jus alpukat creamy dengan rasa alami yang lembut dan halus.','refreshing','fresh juice',35000,'/assets/images/menu/menu_0986f656f24e.png',true,true,36),
('Tropic Pop','Tropic Pop','Refreshing sparkling drink with a tropical fruity burst.','Minuman sparkling yang menyegarkan dengan sensasi buah tropis yang meledak di mulut.','refreshing','sparkling drink',28000,NULL,true,false,37),
('Mint Pop','Mint Pop','Refreshing sparkling drink infused with cool mint flavor.','Minuman sparkling yang menyegarkan dengan sentuhan rasa mint yang dingin.','refreshing','sparkling drink',30000,'/assets/images/menu/menu_ed3948aa5372.png',true,true,38),
('Sunset Spark','Sunset Spark','Refreshing sparkling drink with a tropical citrus twist.','Minuman sparkling yang menyegarkan dengan sentuhan citrus tropis.','refreshing','sparkling drink',32000,NULL,true,false,39),
('Strawberry Mint Pop','Strawberry Mint Pop','Refreshing sparkling drink with sweet strawberry and cool mint flavor.','Minuman sparkling yang menyegarkan dengan rasa stroberi manis dan sentuhan mint yang dingin.','refreshing','sparkling drink',34000,'/assets/images/menu/menu_4c95c33116a4.png',true,false,40),

-- ── Creamy Delights ────────────────────────────────────────
('Oreo Smash','Oreo Smash','Creamy milkshake blended with crushed Oreo cookies.','Milkshake creamy yang dipadukan dengan remahan biskuit Oreo.','creamy-delights','milkshake',36000,'/assets/images/menu/menu_5f5cd775156f.png',true,true,41),
('Vanilla Crush','Vanilla Crush','Creamy vanilla milkshake with a smooth sweet finish.','Milkshake vanila creamy dengan akhir rasa manis yang lembut.','creamy-delights','milkshake',38000,'/assets/images/menu/menu_7cf983daea72.png',true,false,42),
('Choco Crush','Choco Crush','Rich chocolate milkshake with a creamy smooth texture.','Milkshake cokelat yang kaya rasa dengan tekstur creamy yang lembut.','creamy-delights','milkshake',40000,'/assets/images/menu/menu_b2d9f359a971.png',true,false,43),
('Strawberry Crush','Strawberry Crush','Creamy strawberry milkshake with a sweet fruity taste.','Milkshake stroberi creamy dengan rasa buah yang manis.','creamy-delights','milkshake',40000,'/assets/images/menu/menu_4ab42a0e58e9.png',true,false,44),
('Biscoff Shake','Biscoff Shake','Creamy milkshake blended with crunchy Biscoff cookies.','Milkshake creamy yang dipadukan dengan biskuit Biscoff yang crunchy.','creamy-delights','milkshake',40000,'/assets/images/menu/menu_002ba27cea09.png',true,true,45),
('Affogato Shoot','Affogato Shoot','Espresso poured over vanilla ice cream for a bold and creamy dessert drink.','Espresso yang dituangkan di atas es krim vanila untuk minuman dessert yang bold dan creamy.','creamy-delights','float',28000,'/assets/images/menu/menu_78ac73024947.png',true,true,46),
('Cola Cream Float','Cola Cream Float','Chilled cola topped with creamy vanilla ice cream.','Cola dingin yang dipadukan dengan es krim vanila creamy di atasnya.','creamy-delights','float',28000,'/assets/images/menu/menu_78c0dd313492.png',true,false,47),
('Matcha Cream Float','Matcha Cream Float','Japanese matcha topped with creamy vanilla ice cream.','Matcha khas Jepang yang dipadukan dengan es krim vanila creamy di atasnya.','creamy-delights','float',34000,'/assets/images/menu/menu_a55119d16838.png',true,false,48),
('Hot Cocoa Classic','Hot Cocoa Classic','Rich hot chocolate with a smooth creamy taste.','Hot chocolate yang kaya rasa dengan tekstur creamy yang lembut.','creamy-delights','chocolate',32000,'/assets/images/menu/menu_cb69fa5983d2.png',true,false,49),
('Iced Cocoa','Iced Cocoa','Chilled chocolate drink with a smooth and creamy taste.','Minuman cokelat dingin dengan rasa yang lembut dan creamy.','creamy-delights','chocolate',34000,'/assets/images/menu/menu_a5659d40d35a.png',true,true,50),
('Dark Melt','Dark Melt','Rich dark chocolate drink with a smooth, slightly bitter and creamy finish.','Minuman dark chocolate yang kaya rasa dengan akhir yang lembut, sedikit pahit, dan creamy.','creamy-delights','chocolate',40000,NULL,true,false,51),
('Salted Cocoa','Salted Cocoa','Rich chocolate drink with a hint of sea salt for a balanced sweet-salty taste.','Minuman cokelat kaya rasa dengan sentuhan sea salt untuk perpaduan rasa manis dan gurih yang seimbang.','creamy-delights','chocolate',44000,NULL,true,false,52),

-- ── Beverages ──────────────────────────────────────────────
('Bintang Small','Bintang Small','Light Indonesian beer with a crisp and refreshing taste.','Bir ringan khas Indonesia dengan rasa yang segar dan ringan.','beverages','21+',38000,NULL,true,false,53),
('Heineken','Heineken','Smooth and crisp lager beer with a refreshing balanced taste.','Bir lager yang smooth dan crisp dengan rasa segar yang seimbang.','beverages','21+',48000,NULL,true,false,54),
('Bintang Large','Bintang Large','Light Indonesian lager beer with a crisp and refreshing taste.','Bir ringan khas Indonesia dengan rasa yang segar dan ringan.','beverages','21+',58000,NULL,true,false,55),
('Guinness','Guinness','Dark stout beer with a rich, creamy, and slightly roasted flavor.','Bir stout gelap dengan rasa yang kaya, creamy, dan sedikit roasted.','beverages','21+',58000,NULL,true,false,56),
('Corona','Corona','Light Mexican lager beer with a crisp, smooth, and refreshing taste.','Bir lager ringan khas Meksiko dengan rasa yang crisp, smooth, dan menyegarkan.','beverages','21+',68000,NULL,true,false,57),
('Soju Jinro','Soju Jinro','Korean distilled spirit with a smooth and clean taste, often served chilled. Available in Original, Peach, and Plum variants.','Minuman suling khas Korea dengan rasa yang smooth dan bersih. Tersedia dalam varian: Original, Peach, dan Plum.','beverages','21+',88000,NULL,true,false,58),
('Yakult','Yakult','Sweet probiotic milk drink with a light and refreshing taste.','Minuman susu probiotik dengan rasa manis yang ringan dan menyegarkan.','beverages','soft drink',5000,NULL,true,false,59),
('Mineral Water','Air Mineral','Pure and refreshing drinking water.','Air minum yang murni dan menyegarkan.','beverages','soft drink',10000,NULL,true,false,60),
('Tonic Water','Tonic Water','Carbonated water with a slightly bitter taste, often used as a mixer.','Air berkarbonasi dengan rasa sedikit pahit, sering digunakan sebagai campuran minuman.','beverages','soft drink',15000,NULL,true,false,61),
('Sprite','Sprite','Crisp lemon-lime soda with a refreshing and sweet citrus taste.','Minuman soda lemon-lime dengan rasa citrus yang manis dan menyegarkan.','beverages','soft drink',15000,NULL,true,false,62),
('Coca-Cola','Coca-Cola','Classic carbonated cola drink with a sweet and refreshing taste.','Minuman cola berkarbonasi klasik dengan rasa manis dan menyegarkan.','beverages','soft drink',15000,NULL,true,false,63),
('Ginger Ale','Ginger Ale','Lightly carbonated soft drink with a mild ginger flavor and refreshing sweetness.','Minuman bersoda ringan dengan sentuhan rasa jahe yang lembut dan manis yang menyegarkan.','beverages','soft drink',15000,NULL,true,false,64),

-- ── Food ───────────────────────────────────────────────────
('Bala-Bala','Bala-Bala','Crispy Indonesian vegetable fritters with a savory and crunchy texture.','Bakwan sayur khas Indonesia dengan tekstur gurih dan renyah.','food','light meal',15000,NULL,true,false,65),
('Crispy Fried Tempeh','Tempe Goreng Krispi','Crispy fried tempeh with a savory and crunchy texture.','Tempe goreng renyah dengan tekstur gurih dan crunchy.','food','light meal',15000,NULL,true,false,66),
('Stuffed Tofu Fritters','Tahu Goreng Isi','Crispy fried tofu stuffed with savory seasoned filling.','Tahu goreng renyah dengan isian berbumbu gurih.','food','light meal',15000,NULL,true,false,67),
('Salt And Chili Tofu','Tahu Asin Pedas','Crispy tofu tossed with salt, chili, and savory spices.','Tahu renyah yang dibalut garam, cabai, dan bumbu gurih.','food','light meal',22000,NULL,true,true,68),
('Aglio Olio Chicken','Aglio Olio Chicken','Pasta tossed with garlic, chili, and savory chicken slices.','Pasta yang dipadukan dengan bawang putih, cabai, dan irisan ayam gurih.','food','main course',37000,NULL,true,false,69),
('Aglio Olio Dory','Aglio Olio Dory','Pasta tossed with garlic, chili, and savory dory fish pieces.','Pasta yang dipadukan dengan bawang putih, cabai, dan potongan ikan dory gurih.','food','main course',45000,NULL,true,true,70),
('Creamy Garlic Chicken Pasta','Creamy Garlic Chicken Pasta','Creamy pasta tossed with garlic sauce and savory chicken slices.','Pasta creamy yang dipadukan dengan saus bawang putih dan irisan ayam gurih.','food','main course',45000,NULL,true,false,71),
('Creamy Beef Pasta','Creamy Beef Pasta','Creamy pasta tossed with savory smoked beef and rich sauce.','Pasta creamy yang dipadukan dengan smoked beef gurih dan saus yang kaya rasa.','food','main course',48000,NULL,true,true,72),
('Aglio Olio Salmon','Aglio Olio Salmon','Pasta tossed with garlic, chili, and savory salmon pieces.','Pasta yang dipadukan dengan bawang putih, cabai, dan potongan salmon gurih.','food','main course',55000,NULL,true,false,73),
('Sun-Kissed Margherita','Sun-Kissed Margherita','Fresh tomato sauce topped with creamy mozzarella and sweet cherry tomatoes.','Saus tomat segar dengan topping mozzarella creamy dan cherry tomato yang manis.','food','pizza',60000,'/assets/images/menu/menu_bf0d65f94483.png',true,true,74),
('Woodland Mushroom Melt','Woodland Mushroom Melt','Sauteed mushrooms topped with melted mozzarella cheese.','Jamur tumis dengan topping keju mozzarella yang meleleh.','food','pizza',62000,'/assets/images/menu/menu_86b3b7c4f0aa.png',true,false,75),
('Firewood Pepperoni Basil','Firewood Pepperoni Basil','Classic pepperoni pizza topped with tomato sauce, melted mozzarella, and fresh basil.','Pizza pepperoni klasik dengan saus tomat, mozzarella leleh, dan basil segar.','food','pizza',65000,'/assets/images/menu/menu_1b1182036c6d.png',true,false,76),
('Golden Sesame Banana Fritters','Golden Sesame Banana Fritters','Crispy sesame banana fritters served with warm chocolate sauce.','Pisang goreng wijen yang renyah disajikan dengan saus cokelat hangat.','food','pastry',32000,'/assets/images/menu/menu_a2b236382311.png',true,false,77),
('Burnt Basque Cheesecake','Burnt Basque Cheesecake','Creamy baked cheesecake with a caramelized burnt top and rich flavor.','Cheesecake panggang yang creamy dengan permukaan burnt caramelized dan rasa yang kaya.','food','pastry',35000,'/assets/images/menu/menu_bc8835238ea8.png',true,true,78),
('Dark Chocolate Silk Panna Cotta','Dark Chocolate Silk Panna Cotta','Silky dark chocolate panna cotta served with vanilla sauce and fresh fruits.','Panna cotta dark chocolate yang silky disajikan dengan saus vanila dan buah segar.','food','pastry',38000,NULL,true,false,79),
('Nonna''s Classic Tiramisu','Nonna''s Classic Tiramisu','Espresso-soaked ladyfingers layered with smooth mascarpone cream.','Ladyfingers yang direndam espresso dengan lapisan mascarpone cream yang lembut.','food','pastry',42000,'/assets/images/menu/menu_d2618f6b7be8.png',true,false,80);
