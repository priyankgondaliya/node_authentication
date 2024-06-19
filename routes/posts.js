const express = require("express");
const Post = require("../models/post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new post
router.post("/", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const post = new Post({ title, content, author: req.user._id });
  try {
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
          "authorDetails.name": 1,
          "authorDetails.email": 1,
          // Ensure to exclude password and other unnecessary fields
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
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const post = await Post.findOneAndUpdate(
      { _id: id, author: req.user._id },
      { title, content },
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
