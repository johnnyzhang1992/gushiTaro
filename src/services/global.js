import Request from "../apis/request";

export const fetchRandomSentence = (method, data) => {
	return Request(`/wxxcx/getRandomSentence`, data, method);
};
