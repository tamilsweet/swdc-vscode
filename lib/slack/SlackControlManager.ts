import { api_endpoint } from "../Constants";
import { getItem, launchWebUrl } from "../Util";
import { refetchSlackConnectStatusLazily } from "../DataController";
const { WebClient } = require("@slack/web-api");
import { showQuickPick } from "../MenuManager";

export async function connectSlack() {
    // auth/slack/workspace is the other api endpoint to try
    // to get slack to show the workspace prompt but that's not working either
    const endpoint = `${api_endpoint}/auth/slack?integrate=slack&token=${getItem(
        "jwt"
    )}`;
    launchWebUrl(endpoint);
    refetchSlackConnectStatusLazily();
}

export async function showSlackChannelMenu() {
    let menuOptions = {
        items: []
    };

    // get the available channels
    const channelNames = await getChannelNames();
    channelNames.sort();

    channelNames.forEach(channelName => {
        menuOptions.items.push({
            label: channelName
        });
    });

    const pick = await showQuickPick(menuOptions);
    return pick.label;
}

async function getChannels() {
    const slackAccessToken = getItem("slack_access_token");
    const web = new WebClient(slackAccessToken);
    const result = await web.channels.list().catch(err => {
        console.log("Unable to retrieve slack channels: ", err.message);
        return [];
    });
    if (result && result.ok) {
        return result.channels;
    }
    return [];
}

async function getChannelNames() {
    const channels = await getChannels();
    if (channels && channels.length > 0) {
        return channels.map(channel => {
            return channel.name;
        });
    }
    return [];
}