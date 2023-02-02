const axios = require("axios");
const fs = require("fs");

const getUserPoints = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
    return Math.round(response.data.data.object.performance_points * 1000) / 1000;
};

const getUserProfile = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
    return response.data.data.object;
};

const getProblem = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/problem/${name}`);
    return response.data.data.object;
};
const checkUserExists = async (name) => {
    try {
        await axios.get(`https://dmoj.ca/api/v2/user/${name}`);
        return true;
    } catch (err) {
        return false;
    }
};

const checkDiscordUserLinked = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    return json.guilds[guildID].hasOwnProperty(id);
};

const getUsername = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    return json.guilds[guildID][id].name;
};

const getUserSubmissions = async (name) => {
    const response = await axios.get(`https://dmoj.ca/api/v2/submissions?user=${name}`);
    return response.data.data;
}

const cacheUserSubmissions = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    const submissionData = await getUserSubmissions(json.guilds[guildID][id].name);
    for (let i = submissionData.total_objects - 1; i >= json.guilds[guildID][id].submissions.count; i--) {
        const curr = submissionData.objects[i].language;
        if (!json.guilds[guildID][id].submissions.data.hasOwnProperty(curr)) {
            json.guilds[guildID][id].submissions.data[curr] = 0;
        }
        json.guilds[guildID][id].submissions.data[curr]++;
    }
    json.guilds[guildID][id].submissions.count = submissionData.total_objects;
    try {
        fs.writeFileSync("views/dmoj.json", JSON.stringify(json));
    } catch (err) {
        console.log(err);
    }
}

const getCachedUserSubmissions = async (id, guildID) => {
    const file = fs.readFileSync('views/dmoj.json');
    const json = JSON.parse(file.toString());
    return json.guilds[guildID][id].submissions;
}

const updateUserPoints = async (id, guildID) => {
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
const updatePoints = async () => {
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
    getUserSubmissions,
    cacheUserSubmissions,
    getCachedUserSubmissions,
    updatePoints,
    updateUserPoints
};