const express = require("express");
const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // Ensure you import the upload middleware

const router = express.Router();

// Create a new post
// router.post(
//   "/multiple-images",
//   authMiddleware,
//   upload.array("images", 10), // Handle multiple file uploads (up to 10 images)
//   [
//     body("title").notEmpty().withMessage("Title is required"),
//     body("content").notEmpty().withMessage("Content is required"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "At least one image is required" });
//     }

//     const { title, content } = req.body;
//     const images = req.files.map((file) => file.path); // Get the uploaded file paths

//     const post = new Post({ title, content, images, author: req.user._id });
//     try {
//       await post.save();
//       res.status(201).json(post);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
// );

router.post(
  "/",
  authMiddleware,
  upload.single("image"), // Handle single file upload
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const { title, content } = req.body;
    const image = req.file ? req.file.path : null; // Get the uploaded file path

    const post = new Post({ title, content, image, author: req.user._id });
    try {
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get all posts
router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query.q;
    let matchStage = {};

    if (searchQuery) {
      matchStage = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } },
          { "authorDetails.name": { $regex: searchQuery, $options: "i" } },
          { "authorDetails.email": { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDetails",
        },
      },
      {
        $unwind: "$authorDetails",
      },
      {
        $match: matchStage,
      },
      {
        $project: {
          title: 1,
          content: 1,
          image: 1, // Include image in the projection
          "authorDetails.name": 1,
          "authorDetails.email": 1,
          _id: 1,
          author: 1,
        },
      },
      {
        $unset: "authorDetails.password",
      },
    ]);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single post by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id).populate("author", "name email");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a post by ID
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  const image = req.file.path; // Get the uploaded file path

  try {
    const post = await Post.findOneAndUpdate(
      { _id: id, author: req.user._id },
      { title, content, image },
      { new: true, runValidators: true }
    );
    if (!post) {
      return res
        .status(404)
        .json({ error: "Post not found or not authorized" });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a post by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findOneAndDelete({ _id: id, author: req.user._id });
    if (!post) {
      return res
        .status(404)
        .json({ error: "Post not found or not authorized" });
    }
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
