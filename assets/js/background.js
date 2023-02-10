chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, updatedTab) {
    if (changeInfo.status === "complete" && updatedTab.url.indexOf("https://www.codingame.com/clashofcode/clash/report/") !== -1) {
        chrome.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: ["assets/js/replay.js"],
        });
    }
});