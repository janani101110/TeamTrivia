const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');

router.post('/bookmark', async (req, res) => {
    try {
        const { userId, blogPostId } = req.body;

        const existingBookmark = await Bookmark.findOne({ user: userId, blogPost: blogPostId });
        if (existingBookmark) {
            await Bookmark.findByIdAndDelete(existingBookmark._id);
            return res.status(200).json({ message: "Bookmark deleted successfully" });
        }

        const newBookmark = new Bookmark({ user: userId, blogPost: blogPostId });
        await newBookmark.save();
        res.status(201).json(newBookmark);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post('/resobookmark', async (req, res) => {
    try {
        const { userId, resoPostId } = req.body;

        const existingBookmark = await Bookmark.findOne({ user: userId, resoPost: resoPostId });
        if (existingBookmark) {
            await Bookmark.findByIdAndDelete(existingBookmark._id);
            return res.status(200).json({ message: "Bookmark deleted successfully" });
        }

        const newBookmark = new Bookmark({ user: userId, resoPost: resoPostId });
        await newBookmark.save();
        res.status(201).json(newBookmark);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const blogBookmarks = await Bookmark.find({ user: userId, blogPost: { $exists: true } }).populate('blogPost');
        const resoBookmarks = await Bookmark.find({ user: userId, resoPost: { $exists: true } }).populate('resoPost');

        const combinedBookmarks = [...blogBookmarks, ...resoBookmarks];

        res.status(200).json(combinedBookmarks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;