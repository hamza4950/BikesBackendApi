import mongoose from 'mongoose';
const Schema = mongoose.Schema;

function changeIdType(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
}

const BikeSchema = new Schema({
    name: {type: String, required: true},
    manufacturer: {type: String, required: false},
    year: {type: Number, required: false},
    belongsTo: { type: Schema.ObjectId, ref: "User", required: true },
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

BikeSchema.pre('remove', async function(next) {
    await mongoose.model('Component').deleteMany({ belongsTo: this._id });
    next();
});

BikeSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await mongoose.model('Component').deleteMany({ belongsTo: doc._id });
    }
});

BikeSchema.post('deleteMany', async function(result) {
    if (result.deletedCount > 0) {
        const deletedBikes = await this.model.find(this.getQuery());
        const bikeIds = deletedBikes.map(bike => bike._id);
        await mongoose.model('Component').deleteMany({ belongsTo: { $in: bikeIds } });
    }
});

BikeSchema.post(['findOne', 'findOneAndUpdate'], function(ret) {
    if (!ret) 
      return;
    
    if (this.mongooseOptions().lean) 
        return changeIdType(null, ret);
});

const BikeModel = mongoose.model("Bike", BikeSchema);

export default BikeModel;
