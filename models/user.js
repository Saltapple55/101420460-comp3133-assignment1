const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({   
        username:{
                type: String,
                required: [true, "Username has already been used"],
                unique: true,
            }, 
        email: {
                type: String,
                required: [true, "Email has already been used"],
                unique: true,
            },
        password: {
                type: String,
                required: true,
            }, 
        created_at: {
                type: Date,
                default: Date.now(),
            },
        updated_at: {
                type: Date,
                default: Date.now(),
            }
        
})
userSchema.pre("findOneAndUpdate", function(next) {
    this.set({ updated_at: Date.now() });
    next();
})
module.exports=mongoose.model('User', userSchema)