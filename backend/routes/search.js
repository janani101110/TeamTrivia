// const express = require('express');
// const router = express.Router();
// const ResoPost = require('../models/ResoPost');
// const blogPost = require('../models/blogPost');

// router.get("/search", async (req, res) => {
//     const { search } = req.query;
//     console.log("Received query:", { search });
  
//     try {
//       // Constructing a search filter based on the search query
//       const searchFilter = {
//         title: { $regex: search, $options: "i" },
//       };
  
//       // Retrieving posts from both ResoPost and Post collections
//       const [resoPosts, blogPosts] = await Promise.all([
//         ResoPost.find(search ? searchFilter : null),
//         Post.find(search ? searchFilter : null)
//       ]);
  
//       // Combining the results
//       const combinedResults = [...resoPosts, ...blogPosts];
//       console.log("Filtered posts:", combinedResults);
  
//       // Sending a success response with the combined posts
//       res.status(200).json(combinedResults);
//     } catch (err) {
//       // Handling errors if any occur during the process
//       console.log("Error retrieving posts:", err);
//       res.status(500).json(err);
//     }
//   });
  
//   module.exports = router;