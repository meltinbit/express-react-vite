import mysql from "mysql2/promise";
import { Session } from "@shopify/shopify-api/dist/auth/session/index.js";
import moment from "moment";
import dotenv from "dotenv"
dotenv.config()

const connection = await mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
});

export async function storeCallback(session) {
	console.log("storeCallback ID => ", session.id);
	try {
		const [rows, fields] = await connection.execute(
			`INSERT INTO sessions (session_id, shop_url, session, created, modified) VALUES ('${session.id
			}', '${session.shop}', '${JSON.stringify(
				session
			)}', NOW(), NOW()) ON DUPLICATE KEY UPDATE session_id='${session.id
			}', shop_url='${session.shop}', session='${JSON.stringify(
				session
			)}', modified=NOW()`
		);
		return true;
	} catch (e) {
		//throw new Error(e)
		return false;
	}
}

export async function loadCallback(id) {
	console.log("loadCallback ID => ", id);
	try {
		if (!id) {
			return false;
		}

		let session = new Session(id);
		const [rows, fields] = await connection.execute(
			`SELECT * FROM sessions WHERE session_id='${id}' LIMIT 1`
		);

		if (!rows) {
			return false;
		}
		session = rows[0].session;
		return Object.assign(new Session(), JSON.parse(session));
	} catch (e) {
		//throw new Error(e)
		return false;
	}
}

export async function deleteCallback(id) {
	console.log("deleteCallback ID => ", id);
	try {
		const [rows, fields] = await connection.execute(
			`DELETE FROM sessions WHERE session_id='${id}'`
		);
		return true;
	} catch (e) {
		//throw new Error(e)
		return false;
	}
}

export async function activeShops() {
	try {
		const [rows, fields] = await connection.execute(
			`SELECT shop_url, session FROM sessions`
		);

		if (!rows) {
			return false;
		}

		let active_shops = {};
		rows.forEach((row) => {
			let shop = row.shop_url;
			let scopes = JSON.parse(row.session).scope;
			if (scopes) {
				active_shops[shop] = scopes;
			}
		});
		console.log("retriving active shops...");
		return active_shops;
	} catch (e) {
		return false;
	}
}

export async function getAccessToken(id) {
	try {
		if (!id) {
			return false;
		}

		const [rows, fields] = await connection.execute(
			`SELECT * FROM sessions WHERE session_id='${id}' LIMIT 1`
		);

		if (!rows) {
			return false;
		}
		const session = JSON.parse(rows[0].session);
		return session.accessToken;
	} catch (e) {
		//throw new Error(e)
		return false;
	}
}

export async function uninstallShop(shop) {
	try {
		//removes the session
		const [res, flds] = await connection.execute(
			`DELETE FROM sessions WHERE shop_url='${shop}'`
		);

		//update the cancelledOn date on installations
		const [rows, fields] = await connection.execute(
			`UPDATE installations SET status='uninstalled', cancelledOn = NOW(), trialUsed = DATEDIFF(NOW(), createdAt) WHERE shop='${shop}'`
		);
		return true;
	} catch (e) {
		//throw new Error(e)
		return false;
	}
}

export async function checkBillingCharge(shop) {
	try {
		const trialDays = parseInt(process.env.TRIAL_DAYS);
		const [installation] = await connection.execute(
			`SELECT * FROM installations WHERE shop='${shop}' ORDER BY trialUsed DESC LIMIT 1`
		);

		if (installation.length) {
			return trialDays - installation[0].trialUsed > 0
				? trialDays - installation[0].trialUsed
				: 0;
		} else {
			return trialDays;
		}
	} catch (e) {
		return false;
	}
}

export async function createBillingCharge(data, shop) {
	try {
		const id = data.id.split("/").pop();
		const createdAt = moment(data.created_at).format("YYYY-MM-DD H:mm:s");
		const [rows, fields] = await connection.execute(
			`INSERT INTO installations (charge_id, shop, name, createdAt, trialDays, test, status) VALUES 
			(${id}, '${shop}', '${data.name}', '${createdAt}' ,${data.trialDays}, ${data.test
			} ,'${data.status.toLowerCase()}')`
		);

		console.log("Charge created on DB!");
		return true;
	} catch (e) {
		return false;
	}
}

export async function updateBillingCharge(data) {
	console.log("trying to update Charge!");
	try {
		const createdAt = moment(data.created_at).format("YYYY-MM-DD H:mm:s");
		const [rows, fields] = await connection.execute(
			`UPDATE installations SET trialEnds='${data.trial_ends_on}', billingOn='${data.billing_on
			}',  status='${data.status.toLowerCase()}', price=${data.price
			} WHERE charge_id=${data.id}`
		);

		console.log("Charge updated on DB!");
		return true;
	} catch (e) {
		return false;
	}
}

export async function isPayingStore(shop) {
	try {
		const [result] = await connection.execute(
			`SELECT * FROM installations WHERE shop='${shop}' AND status = 'active' LIMIT 1`
		);

		if (result.length) {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		return false;
	}
}
