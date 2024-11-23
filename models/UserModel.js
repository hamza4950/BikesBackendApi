import mongoose from 'mongoose'
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';


function changeIdType(doc, ret) {
	ret.id = ret._id.toString();
	delete ret._id;
	delete ret.__v;

	return ret;
}

const UserSchema = new Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true },
	isConfirmed: { type: Boolean, required: true, default: 0 },
	status: { type: Boolean, required: true, default: 1 }
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
	
	UserSchema.post(['findOne', 'findOneAndUpdate'], function(ret) {
		if (!ret) 
		  return;
		
		if(this.mongooseOptions().lean) 
			return changeIdType(null, ret);
	  
	});
UserSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model("User", UserSchema);


export default UserModel