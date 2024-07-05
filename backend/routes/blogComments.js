const express = require('express');

const router = express.Router();
const BlogComment = require('../models/blogComment.js');

// Route for creating a new comment
router.post("/create", async (req, res) => {
  try {
    const newComment = new BlogComment(req.body);
    const savedComment = await newComment.save();

    // If the comment is a reply, update the parent comment's replies
    if (req.body.parentId) {
      await BlogComment.findByIdAndUpdate(req.body.parentId, {
        $push: { replies: savedComment._id }
      });
    }

    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route for deleting a comment by its ID
router.delete("/:id", async (req, res) => {
  try {
    await BlogComment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Comment has been deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route for retrieving comments by post ID
router.get("/post/:postId", async (req, res) => {
  try {
    const blogComments = await BlogComment.find({ postId: req.params.postId, parentId: null })
      .populate({
        path: 'replies',
        populate: { path: 'replies' } // Populate nested replies
      });
    res.status(200).json(blogComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;