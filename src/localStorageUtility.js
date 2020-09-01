const get = (key) => {
    return localStorage.getItem(key);
}

const getDate = (key) => {
    const strDate = localStorage.getItem(key);
    if (strDate) {
        return new Date(strDate)
    }
    
    const now = new Date()
    const yesterday = now.setDate(now.getDate() - 1)
    return yesterday
}

const getArray = (key) => {
    const strLocal = get(key);
    if (!strLocal) return [];

    const arrLocal = JSON.parse(strLocal);
    if (!arrLocal || !arrLocal.length) return [];

    return arrLocal;
}

const set = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

const remove = (key) => {
    localStorage.removeItem(key);
}

const clear = () => {
    localStorage.clear();
}

export default { get, getArray, set, remove, clear, getDate };