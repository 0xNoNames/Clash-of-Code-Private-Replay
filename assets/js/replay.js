const selectedLang = (document.cookie.match(/(?<=cglanguage=)[^;]+/) || [""])[0];
const replayLang = selectedLang === "en" ? "REPLAY" : "REJOUER";
let playersID = [];
let programmingLanguages = [];
let modes = [];
let userID;


(async () => {
    // Get the type of game (public/private), programming languages, modes and IDs of the players who participated in the game
    const response = await fetch("https://www.codingame.com/services/ClashOfCode/findClashReportInfoByHandle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([document.location.pathname.split("/")[4]])
    });
    const data = await response.json();

    if (data.type !== "PRIVATE")
        return;

    programmingLanguages = data.programmingLanguages;
    modes = data.modes;

    // Get current user's ID and current players' ID
    const getUserIdInterval = setInterval(() => {
        const nicknameText = document.getElementsByClassName("nicknameText-0-2-69")[0];
        if (nicknameText) {
            const userNickname = nicknameText.innerHTML.trim();
            userID = data.players.find(obj => obj.codingamerNickname === userNickname).codingamerId;
            data.players.forEach(player => {
                // Do not add the current user to the list of players (so that he doesn't invite himself)
                if (player.codingamerId !== userID)
                    playersID.push(player.codingamerId);
            });
            clearInterval(getUserIdInterval);
        }
    }, 100);
})();


// Create a new "REPLAY" button next to the "BACK TO HOME" button
const replayButton = document.createElement("button");
const tagA = document.createElement("a");

replayButton.innerHTML = replayLang;
replayButton.className = "leave-button";
replayButton.style.cssText = `background-color: #f2bb13;color: #454c55; margin-left: 17px`;

tagA.appendChild(replayButton);

// Try to appendChild the DOM until it succeeds (sometimes the DOM is not fully loaded)
const appendButtonInterval = setInterval(() => {
    try {
        const buttonContainer = document.querySelector(".button-container");
        buttonContainer.appendChild(tagA);
        clearInterval(appendButtonInterval);
    } catch (error) {
        // Do nothing, just keep trying
    }
}, 100);


// Do the magic when the replay button is clicked
tagA.addEventListener("click", async () => {
    // Create a new private game
    const response = await fetch("https://www.codingame.com/services/ClashOfCode/createPrivateClash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([userID, programmingLanguages, modes])
    });

    const data = await response.json();

    // Invite current players to the new private game
    for (const playerID of playersID) {
        fetch("https://www.codingame.com/services/ClashOfCode/inviteCodingamers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([userID, playerID, data.publicHandle])
        });
    }

    // Relocate the user to the new game url
    location = `https://www.codingame.com/clashofcode/clash/${data.publicHandle}`;
});