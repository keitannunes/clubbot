const {createClient} = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function signedUp(id) {
    const {data} = await supabase
        .from('balance')
        .select('discordid')
        .eq('discordid', id);
    return typeof data[0] !== "undefined";
}

async function getBalance(id) {
    const {data} = await supabase
        .from('balance')
        .select('value')
        .eq('discordid', id);
    return data[0].value;
}

async function deleteUser(id) {
    await supabase
        .from('balance')
        .delete()
        .eq('discordid', id);
}

async function setBalance(id, value) {
    await supabase
        .from('balance')
        .update({value: value})
        .eq('discordid', id);
}

async function signUp(id, username) {
    await supabase
        .from('balance')
        .insert([
            {discordid: id, username: username},
        ]);
}

async function getAll() {
    await supabase;
    const {data} = await supabase
        .from('balance')
        .select('*');
    return data;
}

module.exports = {signedUp, deleteUser, getBalance, setBalance, signUp, getAll};