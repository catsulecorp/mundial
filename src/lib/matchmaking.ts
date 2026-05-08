
import { supabase } from './supabase';

export const matchmakingService = {
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  async joinQueue(userId: string) {
    // Insert user into a queue table
    const { error } = await supabase
      .from('matchmaking_queue')
      .insert([{ user_id: userId, status: 'waiting' }]);
    if (error) throw error;
  },

  async findMatch(_userId: string) {
    // This would typically be a database function or a subscription
    // For a simple implementation, let's just use a subscription to the queue
    return supabase
      .channel('matchmaking')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matchmaking_queue' }, payload => {
        console.log('New player joined:', payload);
      })
      .subscribe();
  }
};
