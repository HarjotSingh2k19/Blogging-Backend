import express from "express";
import { getAllBlogs, addBlog, updateBlog, getById, deleteBlog, getByUserId } from "../controllers/blog-controller";
import { authMiddleware } from "../utils/jwtUtil.js";
const blogRouter = express.Router();
import {uploadUserFile} from "../utils/fileUploadUtils.js"

blogRouter.get('/', authMiddleware, getAllBlogs);
blogRouter.post('/add', authMiddleware, uploadUserFile, addBlog);
blogRouter.put('/update/:id', authMiddleware, updateBlog);
blogRouter.get('/:id' , authMiddleware, getById);
blogRouter.delete('/:id', authMiddleware, deleteBlog);
blogRouter.get('/user/:id', authMiddleware, getByUserId);

export default blogRouter;