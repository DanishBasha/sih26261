-- Demo Accounts for SIH26261
-- Password for all demo accounts: Password@123
-- SHA-256 Hash: ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f

INSERT INTO public.institutions (
  id, legal_name, institution_type, aicte_permanent_id, state, district, official_email, verification_status
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Apex National Institute of Technology',
  'Government Aided',
  '1-9988776655',
  'Maharashtra',
  'Mumbai',
  'principal@apex.edu',
  'verified'
)
ON CONFLICT (id) DO UPDATE SET verification_status = 'verified';

INSERT INTO public.user_profiles (
  id, email, password_hash, full_name, mobile_number, role, account_status, institution_id
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'institution@apex.edu',
  'ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f',
  'Dr. Ramesh Sharma',
  '9876543210',
  'institution_user',
  'active',
  '11111111-1111-1111-1111-111111111111'
)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f',
  account_status = 'active',
  institution_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.user_profiles (
  id, email, password_hash, full_name, mobile_number, role, account_status
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'official@aicte.gov.in',
  'ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f',
  'Prof. Sunita Deshmukh',
  '9876543211',
  'official',
  'active'
)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f',
  role = 'official', 
  account_status = 'active';

INSERT INTO public.user_profiles (
  id, email, password_hash, full_name, mobile_number, role, account_status
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'admin@aicte.gov.in',
  'ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f',
  'System Administrator',
  '9876543212',
  'admin',
  'active'
)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = 'ff7bd97b1a7789ddd2775122fd6817f3173672da9f802ceec57f284325bf589f',
  role = 'admin', 
  account_status = 'active';
