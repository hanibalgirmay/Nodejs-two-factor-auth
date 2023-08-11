import User, { IUser } from "../models/User";
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const SECRET_KEY = process.env.JWT_SECRET || "";

const generateToken = (user: IUser) => {
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, {
        expiresIn: '1h'
    });
    return token;
}

/**
 * @description Generate QRCODE for user that can be used (two way authentication)
 * @param secretKey 
 * @param email 
 * @returns 
 */
const generateQRCode = async (secretKey: string, email: string) => {
    try {
        const otpUrl = speakeasy.otpauthURL({
            secret: secretKey,
            label: `Auth - ${email}`,
            issuer: 'Hanibal G',
        });

        const qrCodeImage = await qrcode.toDataURL(otpUrl);
        return qrCodeImage;
    } catch (error) {
        console.error('Failed to generate QR code', error);
        throw new Error('Failed to generate QR code');
    }
}

/**
 * @description Generate Verification key for user to use for two-way auth
 * @param secretKey 
 * @returns 
 */
const generateVerificationCode = (secretKey: string): string => {
    // Generate the verification code using the secret key
    const verificationCode = speakeasy.totp({
        secret: secretKey,
        encoding: 'base32',
        algorithm: "sha256"
    });

    // console.log(verificationCode);
    return verificationCode;
};

// When registering a new user or enabling 2FA for an existing user
const registerUser = async (email: string) => {
    // Generate a secret key for the user
    const secret = generateSecretKey();

    // secret key so that we can store it on database or any other persistent storage
    const secretKey = secret.base32;
    // Associate the secret key with the user's account

    // Generate the QR code for the user
    const qrCode = await generateQRCode(secret.base32, email);

    // Return the secret key and QR code to the user
    return {
        secretKey,
        qrCode,
    };
};

/**
 * @description Generate JWT token using user information
 * @returns 
 */
const generateSecretKey = () => {
    const secret = speakeasy.generateSecret();
    return secret;
};

interface AuthenticatedRequest extends Request {
    userId?: string; // Add userId property to Request interface
}

// Middleware to authenticate requests
const authenticate = (resolver: any) => {
    return async (parent: any, args: any, context: any, info: any) => {
        const authHeader = context.req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1]; // Assuming the token is sent as "Bearer <token>"
            // Perform token verification logic here, such as decoding and validating the token
            // If the token is valid, you can set the user information in the context object
            // Example: context.user = decodedUser;
            return resolver(parent, args, context, info);
        } else {
            throw new Error('Unauthorized');
        }
    };
};
// Resolver function to get user profile
const getUserProfile = async (_: any, __: any, { req }: { req: AuthenticatedRequest }) => {
    try {
        const userId = req.userId; // Assuming the authenticated user's ID is available in req.userId

        // Retrieve the user profile based on the userId
        const profile = await User.findById(userId);

        if (!profile) {
            throw new Error('User profile not found');
        }

        return { user: profile };
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch user profile');
    }
};

// Apply authentication middleware to getUserProfile resolver
const authenticatedGetUserProfile = authenticate(getUserProfile);

const Resolvers = {
    Query: {
        getUserProfile: authenticatedGetUserProfile
    },
    Mutation: {
        signUp: async (_: any, { name, email, phone_number, password }: { email: string, name: string, phone_number: string, password: string }) => {
            try {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    return { message: "Email already exists" }
                }

                const hashPassword = await bcrypt.hash(password, 12);
                const user = new User({ name, email, password: hashPassword, phone_number });

                // Register the user and generate the secret key and QR code
                const { secretKey, qrCode } = await registerUser(user.email);

                user.secret = secretKey;
                user.qrcode = qrCode;
                const savedUser = await user.save();
                const token = generateToken(savedUser);

                return { token, qrcode: qrcode, secret: secretKey, user: savedUser };
            } catch (error) {
                console.log(error);
                return { message: "Something is wrong" }
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

        loginWithTwoFactorAuth: async (_: any, { email, verificationCode }: { email: string, verificationCode: string }) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return { message: "User not found" }
                }
                // Retrieve the user's secret key associated with their account from the database
                const secretKey = user.secret;

                // Validate the verification code using the secret key
                const isVerified = speakeasy.totp.verify({
                    secret: secretKey || "",
                    encoding: 'base32',
                    token: verificationCode
                });

                if (!isVerified) {
                    return { message: "Invalid verification code" }
                }

                const token = generateToken(user);

                return { token };
            } catch (error) {
                console.log(error);
                // throw new Error(error);
            }
        },
        changePassword: async (_: any, { currentPassword, newPassword }: { currentPassword: string, newPassword: string }, { req }: { req: Request }) => {
            try {
                const authorizationHeader = req.headers.authorization;
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
    }
};


export default Resolvers;