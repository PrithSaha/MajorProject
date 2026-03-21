const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("✅ DB connected");

    await fixListings();

    mongoose.connection.close();
    console.log("🔌 DB closed");
}

async function fixListings() {
    const listings = await Listing.find({});

    for (let listing of listings) {

        if (listing.geometry && listing.geometry.coordinates?.length) {
            console.log("⏭️ Skipped:", listing.title);
            continue;
        }

        try {
            // 🔥 Better query
            const query = `${listing.location}, ${listing.country}`;

            console.log("🔍 Searching:", query);

            const geoRes = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        format: "json",
                        q: query,
                        limit: 1
                    },
                    headers: {
                        "User-Agent": "wanderlust-app"
                    }
                }
            );

            if (!geoRes.data.length) {
                console.log("❌ Not found:", listing.title);
                continue;
            }

            const data = geoRes.data[0];

            listing.geometry = {
                type: "Point",
                coordinates: [
                    parseFloat(data.lon),
                    parseFloat(data.lat)
                ]
            };

            await listing.save();
            console.log("✅ Fixed:", listing.title);

            // ⏳ IMPORTANT: delay to avoid rate limit
            await new Promise(res => setTimeout(res, 1000));

        } catch (err) {
            console.log("⚠️ Error:", listing.title, "-", err.message);
        }
    }
}

main();