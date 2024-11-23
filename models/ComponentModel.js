import mongoose from 'mongoose'
const Schema = mongoose.Schema;


function changeIdType(doc, ret) {
	ret.id = ret._id.toString();
	delete ret._id;
	delete ret.__v;
    return ret;
}

const ComponentSchema = new Schema({
	name: {type: String, required: true},
	manufacturer: {type: String, required: true},
    price:{type: Number,required: true},
    quality:{type: String,required: false},
	belongsTo: { type: Schema.ObjectId, ref: "Bike", required: true },
}, 
{
    timestamps: true,
    
    toObject: {
        transform: changeIdType
    },
    toJSON: {
        transform: changeIdType
    }
});


ComponentSchema.post(['findOne', 'findOneAndUpdate'], function(ret) {
    if (!ret) 
      return;
    
    if(this.mongooseOptions().lean) 
        return changeIdType(null, ret);
  
});

const ComponentModel = mongoose.model("Component", ComponentSchema);

export default ComponentModel;
