import mongoose,{Schema} from 'mongoose'

const subscriprionSchema=new Schema({

    subscriber:{
        type:Schema.Types.ObjectId,  //one who subscribe
        ref:"User"
    },

    channel:{
        type:Schema.Types.ObjectId, //one whom to subscribe
        ref:"User"
    }

},{ timestamps: true })

export const Subscription=mongoose.model("Subscription",subscriprionSchema)