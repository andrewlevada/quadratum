const fetch = require("node-fetch");

module.exports.handler = async function (event, context) {
	const payload = JSON.parse(Buffer.from(event.body, "base64").toString());
	const res = await fetch(generateRequestUrl(payload.code), { method: "POST" });
	const data = res.json();

	return {
		code: res.status,
		body: data
	};
};

function generateRequestUrl(code) {
	let url = "https://www.figma.com/api/oauth/token?";
	url += `client_id=${process.env.FIGMA_CLIENT_ID}&`;
	url += `client_secret=${process.env.FIGMA_CLIENT_SECRET}&`;
	url += `redirect_uri=${process.env.FIGMA_REDIRECT_URL}&`;
	url += `code=${code}&`;
	url += "grant_type=authorization_code";
	return url;
}
