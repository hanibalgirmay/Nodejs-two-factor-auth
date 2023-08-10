import { UUID, randomUUID } from "crypto";
import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IUser extends Document {
    id: UUID,
    name: string,
    email: string;
    phone_number?: string;
    password: string;
    secret?: string;
    qrcode?: string;
}

const userSchema = new Schema({
    // id: { type: new ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: false },
    password: { type: String, required: true },
    secret: { type: String, required: false },
    qrcode: { type: String, required: false }
})

const User = mongoose.model<IUser>('User', userSchema);

export default User;