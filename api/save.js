import { db } from "./firebase.js";

export async function POST(context, req) {
    try {
        const body = await req.json();
        const { userId, platform, displayName, saveData } = body;

        if (!userId || !saveData) {
            return new Response("Bad Request", { status: 400 });
        }

        await db.collection("saves").doc(userId).set({
            platform,
            displayName,
            saveData,
            updatedAt: DateNow()
        }, {merge: true});

        return new Response("Save data stored successfully", { status: 200 });
    } catch (error) {
        console.error("Error saving data:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}