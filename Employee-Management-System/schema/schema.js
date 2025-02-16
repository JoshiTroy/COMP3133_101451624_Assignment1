const graphql = require('graphql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee'); // Import Employee model
const { GraphQLList, GraphQLID, GraphQLNonNull } = graphql;
const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt } = graphql;

// Define User Type
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        token: { type: GraphQLString }
    })
});

// Define Employee Type
const EmployeeType = new GraphQLObjectType({
    name: 'Employee',
    fields: () => ({
        id: { type: GraphQLString },
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        email: { type: GraphQLString },
        gender: { type: GraphQLString },
        designation: { type: GraphQLString },
        salary: { type: GraphQLInt },
        department: { type: GraphQLString },
        date_of_joining: { type: GraphQLString },
        employee_photo: { type: GraphQLString },
    })
});

// Root Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        hello: {
            type: GraphQLString,
            resolve() {
                return 'Hello, GraphQL is working!';
            }
        },
        getEmployees: {
            type: new GraphQLList(EmployeeType),
            async resolve() {
                return await Employee.find();
            }
        },
        getEmployeeById: {
            type: EmployeeType,
            args: { id: { type: GraphQLID } },
            async resolve(parent, args) {
                return await Employee.findById(args.id);
            }
        }
    }
});

// Mutation for User Signup, Login, and Add Employee
const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        signup: {
            type: UserType,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const { username, email, password } = args;

                // Check if user already exists
                const existingUser = await User.findOne({ email });
                if (existingUser) throw new Error("User already exists");

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create new user
                const user = new User({ username, email, password: hashedPassword });
                await user.save();

                // Generate JWT Token
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

                return { id: user.id, username: user.username, email: user.email, token };
            }
        },

        login: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const { email, password } = args;

                // Check if user exists
                const user = await User.findOne({ email });
                if (!user) throw new Error("Invalid Credentials");

                // Validate password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) throw new Error("Invalid Credentials");

                // Generate JWT Token
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

                return { id: user.id, username: user.username, email: user.email, token };
            }
        },

        addEmployee: {
            type: EmployeeType,
            args: {
                first_name: { type: GraphQLString },
                last_name: { type: GraphQLString },
                email: { type: GraphQLString },
                gender: { type: GraphQLString },
                designation: { type: GraphQLString },
                salary: { type: GraphQLInt },
                department: { type: GraphQLString },
                date_of_joining: { type: GraphQLString },
                employee_photo: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const {
                    first_name,
                    last_name,
                    email,
                    gender,
                    designation,
                    salary,
                    department,
                    date_of_joining,
                    employee_photo
                } = args;

                // Create a new employee
                const employee = new Employee({
                    first_name,
                    last_name,
                    email,
                    gender,
                    designation,
                    salary,
                    department,
                    date_of_joining,
                    employee_photo
                });

                await employee.save();
                return employee;
            }
        },

        updateEmployee: {
            type: EmployeeType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                first_name: { type: GraphQLString },
                last_name: { type: GraphQLString },
                email: { type: GraphQLString },
                gender: { type: GraphQLString },
                designation: { type: GraphQLString },
                salary: { type: GraphQLInt },
                department: { type: GraphQLString },
                date_of_joining: { type: GraphQLString },
                employee_photo: { type: GraphQLString }
            },
            async resolve(parent, args) {
                return await Employee.findByIdAndUpdate(args.id, args, { new: true });
            }
        }
    }
});

// Export Schema
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
