const express = require('express');
const router=express.Router();
const Post=require('../models/blogPost.js');
const Bookmark = require('../models/Bookmark.js');
const { sendEmail } = require('./nodemailer.js');
const pluralize = require('pluralize');

router.get('/popularBlogs', async (req, res) => {
  try {
    const topPosts = await Post.find().sort({ likes: -1 }).limit(3);
    res.status(200).json(topPosts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching top posts", error: err });
  }
});

//Create 
router.post("/create", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();

    // Send email to the user
    const userEmail = req.body.email; // Assume the user's email is sent in the request body
    const postUrl = `http://localhost:3000/InsidePost/${savedPost._id}`; // Adjust the URL to your frontend blog post URL

    const emailSubject = 'Your blog post has been created!';
    const emailText = `Your blog post "${savedPost.title}" has been successfully created. You can view it at: ${postUrl}`;

    await sendEmail(userEmail, emailSubject, emailText);

    res.status(200).json(savedPost);
  } catch (err) {
    console.error('Error creating blog post or sending email:', err);
    res.status(500).json(err);
  }
});



//Update
router.put("/:id", async (req, res) => {
    try{
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});
        res.status(200).json(updatedPost);
    }catch(err){
        res.status(500).json(err);
    }
})



router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id });
    const bookmark =  await Bookmark.deleteMany({ blogPost: req.params.id });
    if (post, bookmark) {
      res.status(200).json("Post and associated bookmarks have been deleted");
    } else {
      res.status(404).json("Post not found");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});





//Get Post Details
router.get("/:id", async (req, res) => {
    try{
        const post = await Post.findById(req.params.id)
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    }
})



//Get All Posts of a user
router.get("/user/:userId", async (req, res) => {
    try{
        const posts = await Post.find({ postedBy: req.params.userId });
        res.status(200).json(posts);
    } catch(err) {
        res.status(500).json(err);
    }
})

/
// Route for retrieving all posts, optionally filtered by a search query
router.get("/", async (req, res) => {
  // Extracting the search query from the request
  const query = req.query;
  console.log("Received query:", query); // Debug: Log the received query

  try {
    let searchFilter = {};

    if (query.search) {
      // Create a regex pattern to match both singular and plural forms
      const pattern = new RegExp(`\\b(${query.search}|${pluralize.singular(query.search)}|${pluralize.plural(query.search)})\\b`, 'i');

      searchFilter = {
        title: { $regex: pattern }
      };
    }

    // Retrieving all posts, filtered by the search query if present
    const posts = await Post.find(searchFilter);
    console.log("Filtered posts:", posts); // Debug: Log the filtered posts
    
    // Sending a success response with the retrieved posts
    res.status(200).json(posts);
  } catch (err) {
    // Handling errors if any occur during the process
    console.log("Error retrieving posts:", err); // Debug: Log any errors
    res.status(500).json(err);
  }
});



// Route to handle post like
router.post("/:postId/like", async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by postId
    const post = await Post.findById(postId);
    const userId = req.body.userId;

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user has already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

    // Add userId to likes array
    post.likes.push(userId);
    await post.save();

    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to handle post unlike
router.delete("/:postId/like/:userId", async (req, res) => {
    const postId = req.params.postId;
    const userId = req.params.userId;
  
    try {
      // Find the post by postId
      const post = await Post.findById(postId);
  
      // Check if the post exists
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      // Check if user has liked the post
      if (!post.likes.includes(userId)) {
        return res.status(400).json({ message: "You have not liked this post" });
      }
  
      // Remove userId from likes array
      post.likes.pull(userId);
      await post.save();
  
      res.status(200).json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });





  




module.exports = router;