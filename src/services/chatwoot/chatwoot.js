import "dotenv/config";
import axios from "axios";

const CHATWOOT_URL = process.env.CHATWOOT_BASE_URL;
const TOKEN = process.env.CHATWOOT_API_TOKEN;

export async function sendMessage(conversationId, content) {
  try {
    await axios.post(
      `${CHATWOOT_URL}/${conversationId}/messages`,
      {
        content,
        message_type: "outgoing"
      },
      {
        headers: { api_access_token: TOKEN }
      }
    );
  } catch (err) {
    console.error("Error enviando mensaje a Chatwoot:", err.response?.data || err.message);
  }
}
