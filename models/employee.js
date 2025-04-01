const mongoose = require('mongoose');
const emailRegEx = /^\S+@\S+\.\S+$/

const employeeSchema = new mongoose.Schema({
first_name: {
    type: String,
    required: true
},
last_name: {
    type: String,
    required: true
},
email: {
    type: String,
    required: true,
    unique: true,
    match: [emailRegEx, "Email has no spaces, and needs @domain.... at the end"]

},
gender: {
  type: String,
  enum: ["Male", "Female", "Other"]
},
designation: {
  type:String,
required: true},
salary: {
  type: Number,
min: 1000},
date_of_joining: {
    type: Date,
    default: Date.now()
},
department: String,
employee_photo: String,
created_at: {
    type: Date,
    default: Date.now()
},
updated_at: {
    type: Date,
    default: Date.now()
}
});
employeeSchema.pre("findOneAndUpdate", function(next) {
  console.log('updating')
    this.set({ updated_at: Date.now() });
    next();
})

const Employee = mongoose.model('Employee', employeeSchema);


module.exports = Employee;