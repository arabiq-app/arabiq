import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const signUp = async ({ email, password, name, level, dialect }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, level, dialect, avatar: initials } },
  });
  if (error) throw error;
  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      auth_id: data.user.id, name, email, avatar: initials, level, dialect, plan: 'None',
    });
    if (profileError && profileError.code !== '23505') throw profileError;
  }
  return data;
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const { data: profile } = await supabase.from('users').select('*').eq('auth_id', session.user.id).single();
  return profile;
};

export const onAuthChange = (callback) => supabase.auth.onAuthStateChange(callback);

const mapTeacher = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  origin: row.origin || '',
  speciality: row.speciality || '',
  bio: row.bio || '',
  fullBio: row.full_bio || row.bio || '',
  teachingStyle: row.teaching_style || '',
  experience: row.experience || '',
  qualifications: row.qualifications || [],
  dialects: row.dialects || [row.speciality || 'Arabic'],
  avatar: row.avatar || row.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
  accent: row.accent_color || '#1A3470',
  rating: row.rating || null,
  reviews: row.reviews || [],
  studentCount: row.student_count || 0,
  reviewCount: row.review_count || 0,
  totalSessions: row.total_sessions || 0,
  price: row.price || 10,
  languages: row.languages || ['English'],
  level: row.levels || ['Beginner'],
  levels: row.levels || ['Beginner'],
  slots: row.slots || [],
  available: row.available !== false,
  status: row.status || 'approved',
  verified: row.verified || false,
  docs: row.docs_submitted || false,
  students: row.student_count || 0,
  sessions: row.total_sessions || 0,
  joined: row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '',
  stripeAccountId: row.stripe_account_id || null,
  stripeOnboarded: row.stripe_onboarded || false,
});

export const getTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapTeacher);
};

export const getAllTeachersAdmin = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapTeacher);
};

export const createTeacher = async (teacher) => {
  const row = {
    name: teacher.name,
    email: teacher.email,
    origin: teacher.origin || '',
    speciality: teacher.speciality || '',
    bio: teacher.bio || '',
    full_bio: teacher.fullBio || teacher.bio || '',
    teaching_style: teacher.teachingStyle || '',
    experience: teacher.experience || '',
    qualifications: teacher.qualifications || [],
    dialects: teacher.dialects || [teacher.speciality || 'Arabic'],
    avatar: teacher.avatar || teacher.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    accent_color: teacher.accent || '#1A3470',
    price: Number(teacher.price) || 10,
    languages: teacher.languages || ['English'],
    levels: teacher.level || teacher.levels || ['Beginner'],
    slots: teacher.slots || [],
    available: teacher.available !== false,
    status: 'approved',
    verified: true,
    docs_submitted: true,
    student_count: 0,
    total_sessions: 0,
    rating: null,
    reviews: [],
  };
  const { data, error } = await supabase.from('teachers').insert(row).select().single();
  if (error) throw error;
  return mapTeacher(data);
};

export const updateTeacher = async (id, updates) => {
  const row = {
    name: updates.name,
    email: updates.email,
    origin: updates.origin,
    speciality: updates.speciality,
    bio: updates.bio,
    full_bio: updates.fullBio || updates.bio,
    teaching_style: updates.teachingStyle,
    experience: updates.experience,
    qualifications: updates.qualifications || [],
    dialects: updates.dialects || [],
    price: Number(updates.price) || 10,
    languages: updates.languages || ['English'],
    levels: updates.level || updates.levels || ['Beginner'],
    slots: updates.slots || [],
    available: updates.available !== false,
    status: updates.status || 'approved',
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('teachers').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapTeacher(data);
};

export const updateTeacherStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('teachers')
    .update({ status, verified: status === 'approved', updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return mapTeacher(data);
};

export const deleteTeacher = async (id) => {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) throw error;
};

export const createBooking = async (bookingData) => {
  const { data, error } = await supabase.from('bookings').insert(bookingData).select().single();
  if (error) throw error;
  return data;
};

export const getUserBookings = async (userEmail) => {
  const { data, error } = await supabase
    .from('bookings').select('*').eq('student_email', userEmail)
    .order('booked_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateBookingStatus = async (bookingId, status) => {
  const { data, error } = await supabase
    .from('bookings').update({ status }).eq('id', bookingId).select().single();
  if (error) throw error;
  return data;
};

export const getAllBookings = async () => {
  const { data, error } = await supabase.from('bookings').select('*').order('booked_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId).select().single();
  if (error) throw error;
  return data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('*').order('joined', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createIssue = async (issueData) => {
  const { data, error } = await supabase.from('issues').insert(issueData).select().single();
  if (error) throw error;
  return data;
};

export const getAllIssues = async () => {
  const { data, error } = await supabase.from('issues').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const incrementTeacherStats = async (teacherId, studentEmail) => {
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('total_sessions, student_count, students_list')
    .eq('id', teacherId)
    .single();
  if (error) throw error;

  const studentsList = teacher.students_list || [];
  const isNewStudent = !studentsList.includes(studentEmail);

  const { data, error: updateError } = await supabase
    .from('teachers')
    .update({
      total_sessions: (teacher.total_sessions || 0) + 1,
      student_count: isNewStudent ? (teacher.student_count || 0) + 1 : (teacher.student_count || 0),
      students_list: isNewStudent ? [...studentsList, studentEmail] : studentsList,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teacherId)
    .select()
    .single();
  if (updateError) throw updateError;
  return mapTeacher(data);
};

export const restoreTeacherSlot = async (teacherId, slot) => {
  const { data: teacher, error } = await supabase
    .from('teachers')
    .select('slots')
    .eq('id', teacherId)
    .single();
  if (error) throw error;
  const currentSlots = teacher.slots || [];
  if (currentSlots.includes(slot)) return;
  const updatedSlots = [...currentSlots, slot];
  const { data, error: updateError } = await supabase
    .from('teachers')
    .update({ slots: updatedSlots, available: true, updated_at: new Date().toISOString() })
    .eq('id', teacherId)
    .select()
    .single();
  if (updateError) throw updateError;
  return mapTeacher(data);
};
export const updateTeacherStripeAccount = async (teacherId, stripeAccountId) => {
  const { data, error } = await supabase
    .from('teachers')
    .update({ stripe_account_id: stripeAccountId, stripe_onboarded: true, updated_at: new Date().toISOString() })
    .eq('id', teacherId)
    .select()
    .single();
  if (error) throw error;
  return mapTeacher(data);
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://arabiq.app/reset-password',
  });
  if (error) throw error;
};
export async function createReview({ teacherId, bookingId, studentName, studentEmail, rating, comment }) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{ teacher_id: String(teacherId), booking_id: bookingId, student_name: studentName, student_email: studentEmail, rating, comment }])
    .select().single();
  if (error) throw error;
  // Recalculate teacher avg rating
  const { data: allReviews } = await supabase.from('reviews').select('rating').eq('teacher_id', String(teacherId));
  if (allReviews && allReviews.length > 0) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase.from('teachers').update({ rating: Math.round(avg * 10) / 10, review_count: allReviews.length }).eq('id', teacherId);
  }
  return data;
}
export async function logActivity(event_type, title, description, icon='📅', color='#2563EB') {
  const { error } = await supabase
    .from('activity_log')
    .insert([{ event_type, title, description, icon, color }]);
  if (error) console.error('Activity log error:', error);
}

export async function getRecentActivity(limit=10) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
export async function getTeacherReviews(teacherId) {
  const { data, error } = await supabase.from('reviews').select('*').eq('teacher_id', String(teacherId)).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    name: r.student_name,
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }),
    bookingId: r.booking_id,
  }));
}
export const getTeacherByEmail = async (email) => {
  const { data, error } = await supabase
    .from('teachers').select('*').eq('email', email).eq('status', 'approved').maybeSingle();
  if (error || !data) return null;
  return mapTeacher(data);
};

export const getTeacherBookings = async (teacherEmail) => {
  const { data, error } = await supabase
    .from('bookings').select('*').eq('teacher_email', teacherEmail)
    .order('booked_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const updateTeacherSlots = async (teacherId, slots) => {
  const { data, error } = await supabase
    .from('teachers')
    .update({ slots, available: slots.length > 0, updated_at: new Date().toISOString() })
    .eq('id', teacherId).select().single();
  if (error) throw error;
  return mapTeacher(data);
};

export const updateTeacherProfile = async (teacherId, updates) => {
  const { data, error } = await supabase
    .from('teachers')
    .update({
      bio: updates.bio,
      full_bio: updates.fullBio || updates.bio,
      teaching_style: updates.teachingStyle,
      experience: updates.experience,
      languages: updates.languages || ['English'],
      price: Number(updates.price) || 10,
      updated_at: new Date().toISOString(),
    })
    .eq('id', teacherId).select().single();
  if (error) throw error;
  return mapTeacher(data);

};

export const updateIssue = async (issueId, updates) => {
  const { data, error } = await supabase
    .from('issues').update(updates).eq('id', issueId).select().single();
  if (error) throw error;
  return data;
  
};

export const getTeacherBookedSlots = async (teacherId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('slot, session_date')
    .eq('teacher_id', String(teacherId))
    .eq('status', 'confirmed');
  if (error) return [];
  return data || [];
};



