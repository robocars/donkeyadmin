const request = require('superagent');

export const getTubes = async (baseUrl, onMessage) => {
    const url = `${baseUrl || ''}/tubes`;
    const resp = await request.get(url);
    if (onMessage) onMessage(`${new Date().toISOString()} - GET - ${url} - ${resp.status}`);
    return (resp || {}).body || [];
}

