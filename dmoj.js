const axios = require("axios");
const fs = require("fs");

getUserPoints = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
    return response.data.data.object.performance_points;
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

updatePoints = async () => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    try {
        for (let guild in json.guilds) {
            for (let username in json.guilds[guild]) {
                json.guilds[guild][username].points = await getUserPoints(json.guilds[guild][username].name);
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
    updatePoints
};