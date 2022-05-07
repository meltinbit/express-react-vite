import React from 'react'
import ReactDOM from 'react-dom'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react'
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

//Components
import Home from './components/Home'
import About from './components/About'

const config = {
	apiKey: import.meta.env.VITE_API_KEY,
	host: new URL(location).searchParams.get("host"),
	forceRedirect: true
}

ReactDOM.render(
	<BrowserRouter>
		<PolarisProvider i18n={translations}>
			<AppBridgeProvider config={config}>
				<React.StrictMode>
					<Routes>
						<Route
							path="/"
							element={
								<Home shop={new URL(location).searchParams.get("shop")} />
							}
						/>
						<Route
							path="/about"
							element={
								<About shop={new URL(location).searchParams.get("shop")} />
							}
						/>
					</Routes>
				</React.StrictMode>
			</AppBridgeProvider>
		</PolarisProvider>
	</BrowserRouter>,
	document.getElementById('root')
);
