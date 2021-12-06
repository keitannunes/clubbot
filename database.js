const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
async function signedUp(id) {
    const { data } = await supabase
        .from('balance')
        .select('id')
        .eq('id', id)
    return typeof data[0] !== "undefined"
}
async function getBalance(id){
    const { data } = await supabase
                    .from('balance')
                    .select('value')
                    .eq('id', id)
    return data[0].value
}
async function setBalance(id,value){
    await supabase
                .from('balance')
                .update({ value: value })
                .eq('id', id)
}
module.exports = {signedUp, getBalance, setBalance}