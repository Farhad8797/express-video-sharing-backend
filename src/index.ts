// import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./db/dbConnect.js";

dotenv.config();

dbConnect();
