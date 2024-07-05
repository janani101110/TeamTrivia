

const express = require("express");
const router = express.Router();
const Questions = require("../models/questions");

 
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
// get all post on the forum.jsx
  // router.get("/", async (req, res) => {
  //   try {
  //     const questions = await Questions.find();
  //     res.send({ status: "ok", data: questions });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }); 
  // Get all questions or search questions by title
router.get("/", async (req, res) => {
  const query = req.query.search || "";
  try {
    const searchFilter = { title: { $regex: query, $options: "i" } };
    const questions = await Questions.find(query ? searchFilter : {});
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
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     console.log(`Fetching shop posts for user ID: ${userId}`); // Log user ID
//     const questions = await Question.find({ postedBy: userId });
//     if (!Question || questions.length === 0) {
//       console.error(`No shop posts found for user ID: ${userId}`);
//       return res.status(404).json({ error: 'No shop posts found' });
//     }
//     res.status(200).json(Question);
//   } catch (err) {
//     console.error('Error fetching shop posts:', err); // Log the error
//     res.status(500).json({ error: 'Error fetching shop posts' });
//   }
// });

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