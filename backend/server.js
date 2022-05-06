import express from "express"
import dotenv from "dotenv"
dotenv.config()

import { Shopify } from "@shopify/shopify-api"

const { HOST, PORT, API_KEY, API_SECRET, SCOPES } = process.env
const ACTIVE_SHOPS = {} //must be populated from database or when server restarts it will be lost and the App must be uninstalled and reinstalled again

Shopify.Context.initialize({
	API_KEY: API_KEY,
	API_SECRET_KEY: API_SECRET,
	SCOPES: SCOPES,
	HOST_NAME: HOST,
	IS_EMBEDDED_APP: true
})

const app = express()

//build URL to send customer to Shopify install page
app.get('/auth', async (req, res) => {
	try {
		const authRoute = await Shopify.Auth.beginAuth(
			req,
			res,
			req.query.shop,
			'/auth/callback',
			true
		)
		console.log('redirecting to Shopify...')
		res.redirect(authRoute)
	} catch (e) {
		console.log('auth: ', e)
	}
})

//after customer clicks the install App button he is redirected to this route
app.get('/auth/callback', async (req, res) => {
	try {
		const shopSession = await Shopify.Auth.validateAuthCallback(
			req,
			res,
			req.query
		)

		ACTIVE_SHOPS[shopSession.shop] = shopSession //must be stored on database or when server restarts it will be lost and the App must be uninstalled and reinstalled again
		console.log('redirecting to App...')
		res.redirect(`/?shop=${req.query.shop}&host=${req.query.host}`)
	} catch (e) {
		console.log('auth callback: ', e)
	}
})

app.get('/', (req, res) => {
	if (typeof ACTIVE_SHOPS[req.query.shop] !== 'undefined') {
		console.log('Authorized!')
		res.sendFile('index.html', { root: '../frontend/dist' })
	} else {
		res.redirect(`/auth?shop=${req.query.shop}&host=${req.query.host}`)
	}
})

app.use(express.static('../frontend/dist'))

app.listen(PORT, console.log(`Server running at https://${HOST}`))