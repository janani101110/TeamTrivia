

const express = require("express");
const router = express.Router();
const Questions = require("../models/questions");
const pluralize = require('pluralize');
 
// create new post 
router.post("/create", async (req, res) => {
    try { 
      // Creating a new post instance using the ResoPost model
      const newQuestion = new Questions(req.body);
      // Saving the new post to the database
      const savedQuestion = await newQuestion.save();
      // Sending a success response with the saved post data
      res.status(200).json(savedQuestion);
    } catch (err) {
      // Handling errors if any occur during the process
      res.status(500).json(err);
    }
  });  

  // Get all questions or search questions by title
router.get("/", async (req, res) => {
  const query = req.query.search || "";
  try {
    let searchFilter = {};

    if (query) {
      // Create a regex pattern to match both singular and plural forms
      const pattern = new RegExp(`\\b(${query}|${pluralize.singular(query)}|${pluralize.plural(query)})\\b`, 'i');

      searchFilter = {
        title: { $regex: pattern }
      };
    }

    // Retrieving all questions, filtered by the search query if present
    const questions = await Questions.find(searchFilter);
    res.status(200).json({ data: questions });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching questions" });
  }
});



  //view post details
  router.get("/:id", async (req, res) => {
    try {
        const question = await Questions.findById(req.params.id); // Corrected findById method
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put("/views/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const question = await Questions.findById(postId);
    if (!question) {   
      return res.status(404).json({ status: "error", message: "Question not found" });
    }

    // Increment the view count by 1
    question.viewCount += 1;
    await question.save();

    res.status(200).json({ status: "success", message: "View count incremented", data: question });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});


//Get All Posts of a user
router.get("/user/:userId", async (req, res) => {
  try{
      const questions = await Questions.find({ postedBy: req.params.userId });
      res.status(200).json(questions);
  } catch(err) {
      res.status(500).json(err);
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const questions = await Questions.findOneAndDelete({ _id: req.params.id });
    if (questions) {
      res.status(200).json("Post and associated bookmarks have been deleted");
    } else {
      res.status(404).json("Post not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;