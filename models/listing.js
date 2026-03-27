const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review=require("./reviews.js")

const listingSchema=new Schema({
    title:{
       type: String,
       required: true,
    },
    description: String,
    image: {
    filename:
    { type: String,
    },
    url:{
        type: String,
    default:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    set:(v)=> v ==="" ?"https://images.unsplash.com/photo-1507525428034-b723cf961d3e":v,
    },
},
    price: Number,
    location: String,
    country: String,
    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        default: "Point"
    },
    coordinates: {
        type: [Number] 
    }
},
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
    geometry: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point"
  },
  coordinates: {
    type: [Number] 
  }
},
});
listingSchema.index({ geometry: "2dsphere" });
listingSchema.post("findOneAndDelete", async (listing)=>{
    if(listing)
    await Review.deleteMany({_id:{$in: listing.reviews}});
})


const Listing=mongoose.model("Listing", listingSchema);
module.exports= Listing;
