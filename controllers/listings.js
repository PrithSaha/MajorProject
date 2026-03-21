const Listing=require("../models/listing");
const axios = require("axios");

module.exports.index= async (req,res)=>{
    const allListing=await Listing.find({});
    res.render("listings/index.ejs", {allListing});
};

module.exports.renderNewForm=async (req,res)=>{
    res.render("listings/new.ejs");
    };

module.exports.showListing= async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews", populate:{path:"author",},}).populate("owner");
    if(!listing){
        req.flash("error","listing you requested for does not exist!" );
        res.redirect("/listings");
    }
    let avgRating = 0;
    if (listing.reviews.length > 0) {
        avgRating =
            listing.reviews.reduce((sum, review) => sum + review.rating, 0) /
            listing.reviews.length;
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing, avgRating });
};

module.exports.createListing = async (req, res, next) => {
    let url, filename;

    if (req.file) {
        url = req.file.path;
        filename = req.file.filename;
    } else {
        url = "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1";
        filename = "default";
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    const location = req.body.listing.location;


    const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                format: "json",
                q: location,
                limit: 1,
            },
            headers: {
                "User-Agent": "wanderlust-app"
            }
        }
    );
    if (!geoRes.data.length) {
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }
    const data = geoRes.data[0];
    newListing.geometry = {
        type: "Point",
        coordinates: [
            parseFloat(data.lon), 
            parseFloat(data.lat) 
        ]
    };
    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success", "new listing created!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested for does not exist!" );
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // 🔹 Update basic fields
    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    // 🔹 Update image if present
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    // 🔥 FIX: Update coordinates
    const location = req.body.listing.location;

    const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                format: "json",
                q: location,
                limit: 1,
            },
            headers: {
                "User-Agent": "wanderlust-app"
            }
        }
    );

    if (geoRes.data.length > 0) {
        const data = geoRes.data[0];

        listing.geometry = {
            type: "Point",
            coordinates: [
                parseFloat(data.lon),
                parseFloat(data.lat)
            ]
        };
    } else {
        console.log("Geocoding failed!");
    }

    await listing.save();

    console.log("UPDATED LISTING:", listing);

    req.flash("success", "listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing =async (req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing deleted!");
    res.redirect("/listings");
};
