const axios = require("axios");
const fs = require("fs")

getUserPoints = async (name) => {
    response = await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
    return response.data.data.object.performance_points;
}

checkUserExists = async (name) => {
    try {
        await axios.get(`https://dmoj.ca/api/v2/user/${name}`)
        return true;
    } catch (err) {
        return false;
    }
}

checkDiscordUserLinked = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json')
    const json = JSON.parse(file.toString())
    return json.guilds[guildID].hasOwnProperty(id)
}

getUsername = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json')
    const json = JSON.parse(file.toString())
    return json.guilds[guildID][id].name
}

updatePoints = async () => {
    const file = fs.readFileSync('views/dmoj.json')
    const json = JSON.parse(file.toString())
    try {
        for (guild in json.guilds) {
            for (username in json.guilds[guild]) {
                json.guilds[guild][username].points = await getUserPoints(json.guilds[guild][username].name);
            }
        }
        fs.writeFileSync("views/dmoj.json", JSON.stringify(json))
        console.log("Successfully updated points")
    } catch(err) {
        console.log(err)
    }
}


module.exports = { getUserPoints, checkUserExists, checkDiscordUserLinked, getUsername, updatePoints }