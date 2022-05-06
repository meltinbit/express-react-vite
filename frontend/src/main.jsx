import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react'

const config = {
	apiKey: import.meta.env.VITE_API_KEY,
	host: new URL(location).searchParams.get("host"),
	forceRedirect: true
}

ReactDOM.render(
	<AppBridgeProvider config={config}>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</AppBridgeProvider>,
	document.getElementById('root')
);
