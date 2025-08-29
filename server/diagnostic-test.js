import { supabase } from '../src/config/supabase.js';

const main = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_tbl')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('Data fetched successfully:', data);
    }
  } catch (error) {
    console.error('Error in diagnostic test:', error);
  }
};

main();