import express from "express"
import dotenv from "dotenv"
dotenv.config()

import { Shopify } from "@shopify/shopify-api"

import {
	storeCallback,
	loadCallback,
	deleteCallback,
	activeShops,
	uninstallShop,
	isPayingStore,
} from "./libs/mysql/database.js"

const { HOST, PORT, API_KEY, API_SECRET, SCOPES, API_VERSION } = process.env


const ACTIVE_SHOPS = await activeShops(); //must be populated from database or when server restarts it will be lost and the App must be uninstalled and reinstalled again

Shopify.Context.initialize({
	API_KEY: API_KEY,
	API_SECRET_KEY: API_SECRET,
	SCOPES: SCOPES,
	HOST_NAME: HOST,
	IS_EMBEDDED_APP: true,
	API_VERSION: API_VERSION,
	SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
		storeCallback,
		loadCallback,
		deleteCallback
	)
})

const app = express()
app.use(express.json())

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

app.post('/graphql', async (req, res) => {
	//TODO it requires a middleware to validate the JWT
	const session = await Shopify.Utils.loadCurrentSession(req, res);
	const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);
	const response = await client.query({
		data: {
			query: req.body.query,
			variables: req.body.variables
		}
	});
	res.send(response)
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