import services from "../utils/services";

export const API_BASE_URL = services.API_BASE_URL;

export const getApiUrl = endpoint => API_BASE_URL + endpoint;

export const CHECK_ELIGIBLITY = getApiUrl('/checkEligibility');