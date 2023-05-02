const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middlewares/fetchUser");
const Notes = require("../models/Notes");

router.get("/fetchAllNotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    response.json(error);
  }
});

//add note
router.post(
  "/addNote",
  fetchUser,
  [
    body("title", "Enter a title").exists(),
    body("description", "Minimun 5 lines are required.").isLength(5),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //this errors are omitted when user requested with a bad details .
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, description } = req.body;

      // const note = new Notes({
      //   title, description, user: req.user.id
      // })
      // const savedNote = await note.save()

      const note = await Notes.create({
        title,
        description,
        user: req.user.id,
      });

      res.json(note);
      console.log(note);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }
);

router.put("/updateNote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.send("Not Found").status(404);
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    const response = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    const notes = await Notes.find({ user: req.user.id });

    res.json(notes);
  } catch (error) {
    res.json(error.message);
  }
});

//delete a note

router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
  try {
    //find a note to be deleted if not response will be sent as not found
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //allow deletion only if user owns this note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
