import { Page, Card, Button } from "@shopify/polaris"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";

import client from "../libs/axios-client";

const Home = ({ shop }) => {
	const navigate = useNavigate()
	const app = useAppBridge()



	const session = async () => {
		const sessionToken = await getSessionToken(app)
		console.log(sessionToken)
	}

	const tryAxios = async () => {
		const query = `query GetProducts($first: Int!) {
			products (first: $first) {
				edges {
					node {
						id
						title
						descriptionHtml
					}
				}
			}
		}`
		const variables = {
			first: 10,
		}
		const response = await client(app).post('/graphql', { query: query, variables: variables })
		console.log(response)
	}

	//const response = await client.post('/graphql')

	useEffect(() => {
		tryAxios()
		//session()
	}, [])

	return (
		<Page title="Homepage">
			<Card title={shop} sectioned>
				<Button onClick={() => navigate('/about')}>Go to About</Button>
			</Card>
		</Page>
	)
}

export default Home