const express = require("express");
const router = express.Router();
const Answer = require("../models/answer.js");
const User = require('../models/User.js');
const { isValidObjectId } = require('mongoose');

// Route for creating a new comment
router.post("/create", async (req, res) => {
  try {
    const newAnswer = new Answer(req.body);
    const savedAnswer = await newAnswer.save();

    // If the comment is a reply, update the parent comment's replies
    if (req.body.parentId) {
      await Answer.findByIdAndUpdate(req.body.parentId, {
        $push: { replies: savedAnswer._id }
      });
    }

    res.status(201).json(savedAnswer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid answer ID' });
    }

    // Find the answer by ID and delete it
    const deletedAnswer = await Answer.findByIdAndDelete(id);

    // Check if the answer exists
    if (!deletedAnswer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    res.status(200).json({ message: 'Answer deleted successfully', deletedAnswer });
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for retrieving comments by post ID
router.get("/answer/:postId", async (req, res) => {
  try {
    const answers = await Answer.find({ postId: req.params.postId, parentId: null })
      .populate({
        path: 'replies',
        populate: { path: 'replies' } // Populate nested replies
      });
    res.status(200).json(answers);
  } catch (err) { 
    res.status(500).json({ error: err.message });
  } 
});
//likes dislikes
router.route('/update/:id').post((req, res) => {
  Answer.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: req.body.likes, dislikes: req.body.dislikes } },
    { new: true }
  )
    .then(answer => res.json(answer))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
