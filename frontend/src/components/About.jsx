import { Page, Card, Button } from "@shopify/polaris"
import { useNavigate } from "react-router-dom";

const About = ({ shop }) => {
	const navigate = useNavigate()
	return (
		<Page title="About">
			<Card title={shop} sectioned>
				<Button onClick={() => navigate('/')}>Go to Home</Button>
			</Card>
		</Page>
	)
}

export default About