import { Page, Card, Button } from "@shopify/polaris"
import { useNavigate } from "react-router-dom";

const Home = ({ shop }) => {
	const navigate = useNavigate()
	return (
		<Page title="Homepage">
			<Card title={shop} sectioned>
				<Button onClick={() => navigate('/about')}>Go to About</Button>
			</Card>
		</Page>
	)
}

export default Home