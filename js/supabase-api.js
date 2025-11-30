// API Service menggunakan Supabase - UPDATED VERSION
const API = {
    // Get all movies or filter by universe
    async getMovies(universe = 'all', search = '') {
        try {
            let query = supabase
                .from('movies')
                .select('*')
                .order('year', { ascending: false });
            
            // Filter by universe
            if (universe !== 'all') {
                query = query.eq('universe', universe);
            }
            
            // Search by title
            if (search) {
                query = query.ilike('title', `%${search}%`);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching movies:', error);
                return [];
            }
            
            return data || [];
        } catch (error) {
            console.error('Error fetching movies:', error);
            return [];
        }
    },
    
    // Get movie detail by ID
    async getMovieDetail(id) {
        try {
            const { data, error } = await supabase
                .from('movies')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) {
                console.error('Error fetching movie detail:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching movie detail:', error);
            return null;
        }
    },
    
    // Get available universes
    async getUniverses() {
        try {
            const { data, error } = await supabase
                .from('movies')
                .select('universe');
            
            if (error) {
                console.error('Error fetching universes:', error);
                return [];
            }
            
            // Get unique universes
            const universes = [...new Set(data.map(item => item.universe))];
            return universes;
        } catch (error) {
            console.error('Error fetching universes:', error);
            return [];
        }
    }
};