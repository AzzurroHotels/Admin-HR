-- CBIT property and shift template seed
-- Run after main_system_setup.sql.
-- This file creates only roster property/role and shift rows.
-- It does NOT create staff members and does NOT create roster assignments.

insert into public.roster_rows (id,department,property_name,row_name,shift_label,start_time,end_time,break_minutes,display_order,staff_type,is_active,active_days,shift_hours,paid_hours,created_at,updated_at) values
('rr_reception_12h_am','Reception','12-Hour Shift','12-Hour Shift','3 AM - 3 PM (3 AM - 7 AM All Properties)','03:00','15:00',0,1,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,12,12,now(),now()),
('rr_reception_12h_pm','Reception','12-Hour Shift','12-Hour Shift','3 PM - 3 AM (11 PM - 3 AM All Properties)','15:00','03:00',0,2,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,12,12,now(),now()),
('rr_allen_am','Reception','Allen','Allen','AM | 7 AM - 3 PM','07:00','15:00',0,3,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_allen_pm','Reception','Allen','Allen','PM | 3 PM - 11 PM','15:00','23:00',0,4,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_central_am','Reception','Central / Pyrmont','Central / Pyrmont','AM | 7 AM - 3 PM','07:00','15:00',0,5,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_central_pm','Reception','Central / Pyrmont','Central / Pyrmont','PM | 3 PM - 11 PM','15:00','23:00',0,6,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_olympic_am','Reception','Olympic','Olympic','AM | 8 AM - 4 PM','08:00','16:00',0,7,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_olympic_pm','Reception','Olympic','Olympic','PM | 4 PM - 12 MN','16:00','00:00',0,8,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_potts_am','Reception','Potts Point','Potts Point','AM | 8 AM - 4 PM','08:00','16:00',0,9,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_potts_pm','Reception','Potts Point','Potts Point','PM | 4 PM - 12 MN','16:00','00:00',0,10,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_reception_days_off','Reception','Reception Days Off','Reception Days Off','Days Off','00:00','00:01',1,11,'Reception',true,'[0,1,2,3,4,5,6]'::jsonb,0.016666666666666666,0,now(),now()),
('rr_ops_9_5','Admin','Operations & Maintenance','Operations & Maintenance','9 AM - 5 PM','09:00','17:00',0,1,'Admin',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_ops_9_9','Admin','Operations & Maintenance','Operations & Maintenance','9 AM - 9 PM','09:00','21:00',0,2,'Admin',true,'[0,1,2,3,4,5,6]'::jsonb,12,12,now(),now()),
('rr_pricing_8_4','Sales','Pricing','Pricing','8 AM - 4 PM','08:00','16:00',0,1,'Sales',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_pricing_9_5','Sales','Pricing','Pricing','9 AM - 5 PM','09:00','17:00',0,2,'Sales',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_marketing_10_6','Sales','Marketing','Marketing','10 AM - 6 PM','10:00','18:00',0,3,'Sales',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_clean_allen_cleaner','Cleaners','Allen (Cleaner)','Allen (Cleaner)','7:30 AM - 12:30 PM','07:30','12:30',0,1,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,5,5,now(),now()),
('rr_clean_allen_house_am','Cleaners','Allen (Housekeeping)','Allen (Housekeeping)','10 AM - 3 PM','10:00','15:00',0,2,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,5,5,now(),now()),
('rr_clean_allen_house_pm','Cleaners','Allen (Housekeeping)','Allen (Housekeeping)','2:30 PM - 5:30 PM (Wed & Thu to 6:30 PM)','14:30','17:30',0,3,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,3,3,now(),now()),
('rr_clean_central_am','Cleaners','Central','Central','8 AM - 1 PM','08:00','13:00',0,4,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,5,5,now(),now()),
('rr_clean_central_pm','Cleaners','Central','Central','6 PM - 10 PM','18:00','22:00',0,5,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,4,4,now(),now()),
('rr_clean_pyrmont','Cleaners','Pyrmont','Pyrmont','10 AM - 2 PM','10:00','14:00',0,6,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,4,4,now(),now()),
('rr_clean_flinders_am','Cleaners','Flinders','Flinders','9 AM - 4 PM','09:00','16:00',0,7,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,7,7,now(),now()),
('rr_clean_flinders_pm','Cleaners','Flinders','Flinders','6 PM - 9 PM','18:00','21:00',0,8,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,3,3,now(),now()),
('rr_clean_potts_am','Cleaners','Potts Point','Potts Point','8 AM - 1 PM','08:00','13:00',0,9,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,5,5,now(),now()),
('rr_clean_potts_pm','Cleaners','Potts Point','Potts Point','6 PM - 9 PM','18:00','21:00',0,10,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,3,3,now(),now()),
('rr_clean_olympic','Cleaners','Olympic','Olympic','10 AM - 2 PM','10:00','14:00',0,11,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,4,4,now(),now()),
('rr_clean_graveyard','Cleaners','Graveyard','Graveyard','10 PM - 6 AM','22:00','06:00',0,12,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,8,8,now(),now()),
('rr_clean_onsite_maintenance','Cleaners','Onsite Maintenance','Onsite Maintenance','6 AM - 6 PM','06:00','18:00',0,13,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,12,12,now(),now()),
('rr_clean_dinner','Cleaners','Dinner Delivery','Dinner Delivery','6 PM - 8 PM','18:00','20:00',0,14,'Cleaners',true,'[0,1,2,3,4,5,6]'::jsonb,2,2,now(),now())
on conflict(id) do nothing;

