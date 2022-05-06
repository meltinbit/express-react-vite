import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { Provider } from '@shopify/app-bridge-react'

/* ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
) */

const config = { apiKey: '24932ce9a3fe577f2522782ad88346ed', host: new URL(location).searchParams.get("host"), forceRedirect: true }

ReactDOM.render(
	<Provider config={config}>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</Provider>,
	document.getElementById('root')
);
