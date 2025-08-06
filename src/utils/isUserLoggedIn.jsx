import { supabase } from "../config/supabase";

async function isUserLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
        console.log('User is logged in:', session.user);
        return true;
    } else {
        console.log('User is not logged in');
        return false;
    }
}

export default isUserLoggedIn;