import type { Request, Response } from 'express';

import User from '../models/User.js';

import bcrypt from 'bcryptjs';


import {generateToken} from '../utils/generateToken.js';

export const registerUser = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user

        const user=new User({
        username,
        email,
        password: hashedPassword,
        });

        await user.save();

        return res.status(201).json({ message: 'User registered successfully', user: {
            id: user.id,
            username: user.username,
            email: user.email
        } });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
    
};





export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if (!isPasswordValid) {
            return res.status(400).json({message: "Incorrect credentials"});
        }

        // generate a token for the user
        const token = generateToken(user._id.toString());

     return res.status(200).json({
    message: "Login successful",
    token,
    user: {
        id: user._id,
        username: user.username,
        email: user.email,
    },
});  

    } catch (error) {
        console.error(error);

        return res.status(500).json({message: "Server error"});
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            message: "Users fetched successfully",
            users,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch users",
        });
    }
};