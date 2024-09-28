import axios from "axios";
// @ts-ignore
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// @ts-ignore
export function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// @ts-ignore
export var retrivedFl=0
export var retrivedFr=0
export var retrivedBl=0
export var retrivedBr=0

export async function Exit() {
    try {
        // Make a GET request to check the user's login status
        const response = await axios.get(getUrlWithNoPort()+':3000/logout', {
            withCredentials: true
        });
        deleteCookie("hash")
        // Update the login status based on the respons
        console.log("Login out successfully.");
        window.location.reload()
    } catch (error) {
        console.error('Login Status Error:', error);
    }
}

// @ts-ignore
export function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

export function getUrlWithNoPort() {
    const url = window.location.href;
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    return baseUrl;
}

export function getIpWithoutProtocol() {
    const url = window.location.href;
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
}