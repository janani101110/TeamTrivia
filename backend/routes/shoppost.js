const express = require("express");
const router = express.Router();

const Shoppost = require("../models/Shoppost");
const cron = require('node-cron');
const nodemailer = require('nodemailer'); 
const pluralize = require('pluralize');
 
 
const scheduleEmail = (shoppost) => {
  const emailTime = new Date(shoppost.createdAt);
  emailTime.setMinutes(emailTime.getMinutes() + 1);  // Add 5 days to the createdAt date

  // Ensure the minutes and hours are two digits for cron format
  const cronMinutes = emailTime.getMinutes().toString().padStart(2, '0');
  const cronHours = emailTime.getHours().toString().padStart(2, '0');
  const cronDay = emailTime.getDate().toString().padStart(2, '0');
  const cronMonth = (emailTime.getMonth() + 1).toString().padStart(2, '0');

  const cronTime = `${cronMinutes} ${cronHours} ${cronDay} ${cronMonth} *`;
  console.log(`Cron time: ${cronTime}`);  // Log the cron time for debugging

  cron.schedule(cronTime, () => {
    console.log('Running cron job to send email');
    sendEmail(shoppost.userEmail);
  });
};

const sendEmail = (to) => {
  console.log(`Sending email to: ${to}`);  // Log the recipient email for debugging

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'triviatechnology2024@gmail.com',
      pass: 'unpg lgmc akgd xmms',
    },
  });

  let mailOptions = {
    from: 'triviatechnology2024@gmail.com',
    to: to,
    subject: 'Your post reminder',
    text: 'This is a reminder about your post. Your post will be deleted soon. You can repost if you want. Thank you!',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);  // Log the error
      return;
    }
    console.log('Email sent: ' + info.response);
  });
};



router.route("/create").post((req, res) => {
  const { name, description, price, contact, imageUrl, userEmail,postedBy } = req.body;

  const newShoppost = new Shoppost({
    name,
    description,
    price,
    contact,
    imageUrl,
    userEmail,
    postedBy,
  });

  newShoppost
    .save()
    .then((savedShoppost) => {
      console.log('Shop post saved:', savedShoppost);  // Log the saved shop post for debugging
      scheduleEmail(savedShoppost);  // Schedule email after saving the shop post
      res.status(201).json({
        message: "Shop post created successfully",
        shoppost: savedShoppost,
      });
    })
    .catch((error) => {
      console.error("Error creating shop post:", error);
      res.status(500).json({ error: "An error occurred while creating the shop post" });
    });
});

// Search shop posts
router.get("/", async (req, res) => {
  const query = req.query.search || "";
  try {
    let searchFilter = {};

    if (query) {
      // Create a regex pattern to match both singular and plural forms
      const pattern = new RegExp(`\\b(${query}|${pluralize.singular(query)}|${pluralize.plural(query)})\\b`, 'i');

      searchFilter = {
        name: { $regex: pattern }
      };
    }

    // Retrieving all shop posts, filtered by the search query if present
    const shopPosts = await Shoppost.find(searchFilter);
    res.status(200).json({ data: shopPosts });
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching shop posts" });
  }
});


router.get("/getpost/:id", async (req, res) => {
  try {
    const shoppost = await Shoppost.findById(req.params.id);
    res.status(200).json(shoppost);
  } catch (err) {
    res.status(500).json({ error: "An error occurred while fetching the shop post" });
  }
});

router.delete("/:id",async (req,res)=>{
  try{
    await Shoppost.findByIdAndDelete(req.params.id);
    res.status(200).json("post has been deleted");
  } catch(err){
    res.status(500).json(err);
  }
});
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching shop posts for user ID: ${userId}`); // Log user ID
    const shopPosts = await Shoppost.find({ postedBy: userId });
    console.log('Shop posts:', shopPosts); // Log fetched shop posts
    if (!shopPosts || shopPosts.length === 0) {
      console.error(`No shop posts found for user ID: ${userId}`);
      return res.status(404).json({ error: 'No shop posts found' });
    }
    res.status(200).json(shopPosts);
  } catch (err) {
    console.error('Error fetching shop posts:', err); // Log the error
    res.status(500).json({ error: 'Error fetching shop posts' });
  }
});


// Endpoint to get ad statistics
router.get('/ad-stats', async (req, res) => {
  try {
    const shopPosts = await Shoppost.find();

    // Initialize a map to hold counts by date
    const dateMap = {};

    shopPosts.forEach(post => {
      const date = post.createdAt.toISOString().split('T')[0]; // Get the date part of the createdAt field
      if (!dateMap[date]) {
        dateMap[date] = { remainingCount: 0, deletedCount: 0 };
      }
      if (post.deleted) { // Assuming you have a 'deleted' field in your Shoppost model
        dateMap[date].deletedCount += 1;
      } else {
        dateMap[date].remainingCount += 1;
      }
    });

    // Convert the dateMap to an array
    const adStats = Object.keys(dateMap).map(date => ({
      date,
      remainingCount: dateMap[date].remainingCount,
      //deletedCount: dateMap[date].deletedCount
    }));

    console.log(adStats); // Log the response data for debugging

    res.json(adStats); // Response handling
  } catch (error) { // Error handling
    console.error("Error fetching ad stats:", error);
    res.status(500).send('Server Error');
  }
});

// Route to get shop posts with filters
router.get("/", async (req, res) => {
  try {
    const { action, range, month } = req.query;
    let query = {};

    if (action) {
     // if (action === "approved") query.approved = true;
     // if (action === "rejected") query.rejected = true;
     // if (action === "created") query.created = true;
      if (action === "added") query.added = true;
    }

    if (range === "monthly" && month) {
      const startDate = new Date(new Date().getFullYear(), month - 1, 1);
      const endDate = new Date(new Date().getFullYear(), month, 0);
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const shopPosts = await Shoppost.find(query);
    res.status(200).json(Shoppost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
