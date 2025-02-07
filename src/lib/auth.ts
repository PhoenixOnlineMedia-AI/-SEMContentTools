import { supabase } from './supabase';

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const auth = {
  signUp: async ({ firstName, lastName, email, password, phone }: SignUpData) => {
    // First, create the auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-success`,
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('Failed to create user');

    try {
      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email,
          phone
        });

      if (profileError) throw profileError;
    } catch (error) {
      // If profile creation fails, we should clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }

    return authData;
  },

  signIn: async ({ email, password }: SignInData) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getProfile: async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    return profile;
  }
};