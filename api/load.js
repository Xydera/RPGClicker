import { db}  from "./firebase.js";

export async function POST(context, req) {
    const userId = new URL(req.url).searchParams.get("userId");

    if (!userId) {
        return new Response("Bad Request", { status: 400 });
    }

    const snap = await db.collection("saves").doc(userId).get();

    return new Response(
        JSON.stringify(snap.exists ? snap.data().saveData : null),
        { headers: { "Content-Type": "application/json" } }
    );
}