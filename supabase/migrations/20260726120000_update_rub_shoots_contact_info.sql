UPDATE site_content
SET value = value
  || jsonb_build_object(
    'phones', jsonb_build_array('0705 500291'),
    'addressLine1', 'Adonai Plaza Opp Be Energy Petrol Station',
    'addressLine2', 'Kampala - Entebbe Rd',
    'city', 'Kampala',
    'country', 'Uganda',
    'mapAddress', 'Adonai Plaza Opp Be Energy Petrol Station, Kampala - Entebbe Rd, Kampala, Uganda'
  ),
  updated_at = now()
WHERE key = 'business';
