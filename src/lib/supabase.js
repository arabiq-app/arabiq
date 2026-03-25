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

// ── Auth helpers ──────────────────────────────────────────────
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('users').select('*').eq('auth_id', user.id).single();
  return profile;
};

export const onAuthChange = (callback) => supabase.auth.onAuthStateChange(callback);

// ── Teacher helpers ───────────────────────────────────────────

// Map Supabase row → app teacher object
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

// ── Booking helpers ───────────────────────────────────────────
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

// ── User helpers ──────────────────────────────────────────────
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

// ── Issues helpers ────────────────────────────────────────────
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
