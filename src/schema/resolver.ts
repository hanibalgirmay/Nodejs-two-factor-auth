import User, { IUser } from "../models/User";
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const SECRET_KEY = "aU$th_$secret"
const generateToken = (user: IUser) => {
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
        expiresIn: '1h'
    });
    return token;
}

const generateQRCode = async (secretKey: string, username: string) => {
    try {
        const otpUrl = speakeasy.otpauthURL({
            secret: secretKey,
            label: `Auth - ${username}`,
            issuer: 'Hanibal G',
        });

        const qrCodeImage = await qrcode.toDataURL(otpUrl);
        return qrCodeImage;
    } catch (error) {
        console.error('Failed to generate QR code', error);
        throw new Error('Failed to generate QR code');
    }
}

// When registering a new user or enabling 2FA for an existing user
const registerUser = async (username: string) => {
    // Generate a secret key for the user
    const secret = generateSecretKey();

    // Store the secret key securely in your database or any other persistent storage
    const secretKey = secret.base32;
    // Associate the secret key with the user's account

    // Generate the QR code for the user
    const qrCode = await generateQRCode(secret.ascii, username);

    // Return the secret key and QR code to the user
    return {
        secretKey,
        qrCode,
    };
};

const generateSecretKey = () => {
    const secret = speakeasy.generateSecret();
    return secret;
};

const Resolvers = {
    Query: {
        getAllUsers: async () => {
            try {
                const _users = await User.find();
                return _users;
            } catch (error) {
                console.error('Failed to fetch users:', error);
                throw error;
            }
        },
        getUserProfile: async (_: any, { email }: { email: string }) => {
            console.log(email);
            //get the object that contains the specified ID.
            return await User.findOne({ email });
        },
    },
    Mutation: {
        signUp: async (_: any, { name, email, phone_number, password }: { email: string, name: string, phone_number: string, password: string }) => {
            try {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    throw new Error("Email already exists");
                }

                const hashPassword = await bcrypt.hash(password, 12);
                const user = new User({ name, email, password: hashPassword, phone_number });

                // Register the user and generate the secret key and QR code
                const { secretKey, qrCode } = await registerUser(user._id);


                user.secret = secretKey;
                user.qrcode = qrCode;
                const savedUser = await user.save();
                const token = generateToken(savedUser);

                return { token, qrcode: qrcode, secret: secretKey, user: savedUser };
            } catch (error) {
                console.log(error);
                // throw new Error(error);
            }
        },
        login: async (_: any, { email, password }: { email: string; password: string }) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    throw new Error('User not found')
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid Password');
                }

                const token = generateToken(user);

                return { token, user };
            } catch (error) {
                console.log(error);
            }
        },
        changePassword: async (_: any, { currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { req }: { req: Request }) => {
            // const result = { message: '', success: false };
            try {
                const authorizationHeader = req.headers.authorization;
                console.log(authorizationHeader);
                if (!authorizationHeader) {
                    return { message: "Authentication token missing", success: false }
                }
                const token = authorizationHeader.replace('Bearer ', '');
                const decodedToken = jwt.verify(token, SECRET_KEY) as JwtPayload;
                const userId = decodedToken?.userId as string;

                const user = await User.findById(userId);
                if (!user) {
                    return { message: "User not found", success: false }
                }
                const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    return { message: "Invalid current password", success: false }
                }

                const hashedNewPassword = await bcrypt.hash(newPassword, 12);
                user.password = hashedNewPassword;
                await user.save();

                return { message: 'Password changed successfully', success: true };
            } catch (error) {
                console.error(error);
                return { message: "Failed to change password", success: false }
            }
        },

        enableTwoFactorAuth: async (
            _: any,
            { username }: { username: string },
        ) => {
            try {
                // Register the user and generate the secret key and QR code
                const { secretKey, qrCode } = await registerUser(username);

                // You can return the QR code to the client for scanning
                return {
                    message: 'Two-factor authentication enabled',
                    secretKey,
                    qrCode,
                };
            } catch (error) {
                console.error(error);
                throw new Error('Failed to enable two-factor authentication');
            }
        }

    }
};
export default Resolvers;