import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from "bcryptjs"; // for hashing password

const emailRegexPattern: RegExp = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/; // email validation

// ts interface for user schema
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{courseId: string}>;
    comparePassword: (password: string) => Promise<boolean>;
};

// model schema
const userSchema: Schema<IUser> = new Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: {
            validator: function (email: string) {
                return emailRegexPattern.test(email);
            },
            message: "Please enter a valid email",
        },
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Your password must be longer than 6 characters"],
        select: false, // this will not return password in response
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ],
    // courses: [
    //     {
    //         courseId: {
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: "Course",
    //         },
    //     },
    // ],
    
},{timestamps: true});

// hash password before saving user
userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10); // 10 is salt
});

// compare password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

// export user model
const userModel: Model<IUser> = mongoose.model("User", userSchema);
export default userModel;