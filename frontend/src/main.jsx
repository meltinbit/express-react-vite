import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from '@shopify/app-bridge-react'

const config = {
	apiKey: import.meta.env.VITE_API_KEY,
	host: new URL(location).searchParams.get("host"),
	forceRedirect: true
}

ReactDOM.render(
	<Provider config={config}>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</Provider>,
	document.getElementById('root')
);
