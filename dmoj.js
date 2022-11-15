const axios = require("axios");
const fs = require("fs");

getUserPoints = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
    return Math.round(response.data.data.object.performance_points*1000)/1000;
};

getUserProfile = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
    return response.data.data.object;
};

getProblem = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/problem/${name}`);
    return response.data.data.object;
};
checkUserExists = async (name) => {
    try {
        await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
        return true;
    } catch (err) {
        return false;
    }
};

checkDiscordUserLinked = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    return json.guilds[guildID].hasOwnProperty(id);
};

getUsername = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    return json.guilds[guildID][id].name;
};

updateUserPoints = async (id,guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    const today = new Date()
    try {
        json.guilds[guildID][id].points[today.toJSON().split("T")[0]] = await getUserPoints(json.guilds[guildID][id].name);
        fs.writeFileSync("views/dmoj.json", JSON.stringify(json));
        console.log("Successfully updated points");
    } catch (err) {
        console.log(err);
    }
}
updatePoints = async () => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    const today = new Date()
    try {
        for (let guild in json.guilds) {
            for (let username in json.guilds[guild]) {
                json.guilds[guild][username].points[today.toJSON().split("T")[0]] = await getUserPoints(json.guilds[guild][username].name);
            }
        }
        fs.writeFileSync("views/dmoj.json", JSON.stringify(json));
        console.log("Successfully updated points");

    } catch (err) {
        console.log(err);
    }
};


module.exports = {
    getUserPoints,
    getUserProfile,
    getProblem,
    checkUserExists,
    checkDiscordUserLinked,
    getUsername,
    updatePoints,
    updateUserPoints
};