import mongoose , {Schema} from "mongoose";

const fileFolderSchema = new Schema({
    name : {
        type : String,
        required : true
    },

    type : {
        type : String,
        enum : ["file", "folder"],
        required : true
    },

    parent : {
        type : Schema.Types.ObjectId,
        ref : "FileFolder",
        default : null
    },

    project : {
        type : Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },

    content : {
        type : String,
        default : null
    },

    language : {
        type : String,
        default : null 
    },

    createdBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
}, { timestamps : true });

//indexing for faster finding and non duplicate files in same parent folder
fileAndFolderSchema.index({ project: 1 });
fileAndFolderSchema.index({ parent: 1 });
fileAndFolderSchema.index(
    { project: 1, parent: 1, name: 1 },
    { unique: true }
);


export const FileFolder = mongoose.model("FileFolder", fileFolderSchema);