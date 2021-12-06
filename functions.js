function rng(min, max) {
    return Math.round(max / (Math.random() * max + min));
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //thank you stackoverflow
}


module.exports = {rng , addCommas};