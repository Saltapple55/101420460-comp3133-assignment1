const express = require('express')
const bcrypt = require('bcrypt');
const app = express()
const {buildSchema} = require('graphql')
const {graphqlHTTP} = require('express-graphql')
const { GraphQLDateTime } = require('graphql-scalars');
const jwt =require("jsonwebtoken"); // Add this at the top

const mongoose = require('mongoose')
const UserModel = require('./models/user')
const employeeModel = require('./models/employee')


const PORT = 4000
const saltRounds=10

//helper function 

const connectDB=async()=>{
    try{

        console.log("Starting connection")
        const DB_NAME="comp3133-assignment"
        const DB_USER_NAME="saltyapple55"
        const DB_PASSWORD="L2eJ1hiNW6I0LirV"
        const CLUSTER_ID= "b9r5q"
        const DB_CONNECTION = `mongodb+srv://${DB_USER_NAME}:${DB_PASSWORD}@cluster0.${CLUSTER_ID}.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    
        mongoose.connect(DB_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(()=>{
            console.log("MongoDB Connected")
        }).catch((err)=>{
            console.log("Error while connecting to Mongodb"+err)
        })
    }
    catch(e){
        console.log("failed to connect because "+e)
    }
}

const gqlSchema = buildSchema(
    //writing file operations here
    //exclamation ! = so that its mandatory
    `
scalar DateTime

    type Employee {
      _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float
    date_of_joining: DateTime
    department: String
    employee_photo: String
    created_at: DateTime
    updated_at: DateTime
  }
    input EmployeeInput {
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float
    date_of_joining: DateTime
    department: String
    employee_photo: String
  }

    type User {
  _id: ID!
  username: String!
  email: String!
  password: String!
 }
  input UserInput {
  username: String!
  email: String!
  password: String!
 }

 type UserToken {
  username: String!
  token: String!
 }
 type Query{
    
    login(username: String!, password: String!) : UserToken
    getUsers: [User]
    getEmployees: [Employee]
    getEmployee(id: ID!): Employee
    searchEmployeebyDepartment(department: String!): [Employee]

}
type Mutation {
    signup( email: String!, username: String!, password: String!) : User
    addEmployee(input: EmployeeInput!): Employee
    updateEmployee(id: ID!, input: EmployeeInput!): Employee
    deleteEmployee(id: ID!): Employee
  }
        
    `)
//resolver - js object
//cannot put many resolvers
const rootResolver = {
    DateTime: GraphQLDateTime,
    signup: async ({email, username, password}) =>{
        const hashedpw= await bcrypt.hash(password, saltRounds)
        const user= new UserModel({
            email, 
            username,
            password: hashedpw
        })
        return user.save()
    },

    login: async  ({username, password}) =>{
        const user = await UserModel.findOne({username: username} )
 
        if(!user) {
            throw new Error("User not found")
        } else {
            const valid= await bcrypt.compare(password, user.password)
            if(!valid){
                throw new Error("password incorrect")
            }
            else{
                const token = jwt.sign(
                    {
                        userId: user._id,
                        userUname: user.username,
                    },
                    "RANDOM-TOKEN",
                    { expiresIn: "24h" }
                    )
                return {username: user.username, token}
            
            }
        }
    
    },

    getUsers:()=>{
        return UserModel.find({})
    },

    getEmployees: ()=>{
        const emps = employeeModel.find({}) 
        return emps
    },

    getEmployee: ({id})=>{
        const emp = employeeModel.findOne({_id: id}) 
        return emp
    },

    searchEmployeebyDepartment: async({department})=>{
        console.log(department)
        const emp =  await employeeModel.find(
            {$or: [{'department': {$regex: new RegExp(department, "i")}},
                {'designation': {$regex: new RegExp(department, "i")}}]})
        console.log(emp)
        return emp
    },

    addEmployee: async({input})=>
        {
            console.log(input.date_of_joining)
            const emp= new employeeModel({
                first_name: input.first_name,
                last_name: input.last_name,
                email: input.email,
                gender: input.gender,
                designation: input.designation,
                salary: input.salary,
                date_of_joining: input.date_of_joining,
                department: input.department,
                employee_photo: input.employee_photo,
            })
            const newEmp = await emp.save()
            return newEmp
    },

    updateEmployee: async({id, input})=>
        {
            const updatedEmp = await employeeModel.findOneAndUpdate({_id: id}, {...input})
            return updatedEmp
},
deleteEmployee: async({id})=>{
    
        const deletedEmp = await employeeModel.findOneAndDelete({_id: id})
        return deletedEmp
}


}
//create object with express graphttp
const graphqlHttp =graphqlHTTP({
    schema: gqlSchema,
    rootValue: rootResolver,
    graphiql: true
})

//add graphqlHttp to express - have to do /'...' before the http
app.use("/graphql", graphqlHttp)

app.listen(PORT, ()=>{
    connectDB()
    console.log("Graphql Server start")
    console.log("http://localhost:4000")

})
//mutation is for insert or delete operations
//can also define scalar with enum
//can write the logic of the get - fine own type, return anything, 