const { supabaseAdmin } = require('../config/supabase');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Seeds test officers and the admin account in Supabase
 * using the Supabase Service Role Admin API.
 * Automatically confirms emails so login works immediately with zero friction!
 */
async function seedStaff() {
  console.log('🌱 Starting Staff & Admin Seeding...');

  // 1. Fetch department IDs
  const { data: depts, error: deptError } = await supabaseAdmin
    .from('departments')
    .select('id, name');

  if (deptError || !depts || depts.length === 0) {
    console.error('❌ Could not fetch departments. Please ensure step 1 migrations ran:', deptError);
    process.exit(1);
  }

  const findDept = (substr) => depts.find(d => d.name.toLowerCase().includes(substr.toLowerCase()))?.id || depts[0].id;

  const staffList = [
    {
      email: 'admin@civicconnect.org',
      password: 'password123',
      fullName: 'City Commissioner (Admin)',
      role: 'admin',
      departmentId: null,
      ward: null,
      phone: '9800000000'
    },
    {
      email: 'officer.roads@civicconnect.org',
      password: 'password123',
      fullName: 'Officer A. Sharma',
      role: 'officer',
      departmentId: findDept('Roads'),
      ward: 'Ward 1',
      phone: '9811111111'
    },
    {
      email: 'officer.sanitation@civicconnect.org',
      password: 'password123',
      fullName: 'Officer R. Singh',
      role: 'officer',
      departmentId: findDept('Sanitation'),
      ward: 'Ward 1',
      phone: '9822222222'
    },
    {
      email: 'officer.electricity@civicconnect.org',
      password: 'password123',
      fullName: 'Officer P. Verma',
      role: 'officer',
      departmentId: findDept('Electricity'),
      ward: 'Ward 1',
      phone: '9833333333'
    },
    {
      email: 'officer.water@civicconnect.org',
      password: 'password123',
      fullName: 'Officer S. Kulkarni',
      role: 'officer',
      departmentId: findDept('Water'),
      ward: 'Ward 2',
      phone: '9844444444'
    }
  ];

  for (const staff of staffList) {
    console.log(`Processing: ${staff.fullName} (${staff.role}) - ${staff.email}...`);

    let userId = null;

    // Try creating via Supabase Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: staff.email,
      password: staff.password,
      email_confirm: true,
      user_metadata: {
        full_name: staff.fullName,
        role: staff.role,
        department_id: staff.departmentId,
        ward: staff.ward,
        phone: staff.phone
      }
    });

    if (createError) {
      if (createError.message.includes('already exists') || createError.status === 422) {
        // User already exists in auth.users, find their ID
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = usersData?.users?.find(u => u.email === staff.email);
        if (existing) {
          userId = existing.id;
          // Ensure email is confirmed and password updated
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: staff.password,
            email_confirm: true
          });
        }
      } else {
        console.warn(`Warning creating ${staff.email}:`, createError.message);
      }
    } else {
      userId = newUser.user.id;
    }

    if (userId) {
      // Upsert profile in public.profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: staff.fullName,
          role: staff.role,
          department_id: staff.departmentId,
          ward: staff.ward,
          phone: staff.phone
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`Profile upsert error for ${staff.email}:`, profileError);
      } else {
        console.log(`✅ Ready: ${staff.email} (${staff.role})`);
      }
    }
  }

  console.log('\n✨ Staff seeding complete! Credentials:');
  console.log('• Admin: admin@civicconnect.org / password123');
  console.log('• Roads Officer: officer.roads@civicconnect.org / password123');
  console.log('• Sanitation Officer: officer.sanitation@civicconnect.org / password123');
  console.log('• Electricity Officer: officer.electricity@civicconnect.org / password123');
  console.log('• Water Officer: officer.water@civicconnect.org / password123');
}

seedStaff().catch(console.error);
