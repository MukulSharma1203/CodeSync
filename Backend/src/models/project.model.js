import mongoose , {Schema} from "mongoose";

const projectSchema = new Schema({
    projectName : {
        type : String,
        required : true
    },

    projectDesc : {
        type : String
    },

    inviteCode : {
        type : String,
        unique : true,
        required : true
    },

    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    collaborators : [{
        user : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },

        role : {
            type : String,
            enum : ["owner","editor","viewer"],
            default : "viewer",
            required : true
        }
    }]
}, { timestamps : true });

projectSchema.index({ "collaborators.user": 1 });
projectSchema.index({_id : 1 , "collaborators.user": 1 });

export default mongoose.model("Project", projectSchema);