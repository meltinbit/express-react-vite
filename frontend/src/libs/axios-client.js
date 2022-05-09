import axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";

const axiosClient = (app) => {
	const instance = axios.create();
	instance.interceptors.request.use(async (config) => {
		return await getSessionToken(app)
			.then((token) => {
				config.headers["Authorization"] = `Bearer ${token}`;
				console.log(config)
				return config;
			}).catch(e => console.log(e));
	});
	return instance
}

export default axiosClient;
