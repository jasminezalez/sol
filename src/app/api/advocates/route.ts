import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET() {
  const data = await db.select().from(advocates);
  console.log("Fetched db advocates:", data);
  return Response.json({ data });
}
