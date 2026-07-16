const Submission = require('../models/Submission');
const Task = require('../models/Task');
const mongoose = require("mongoose");
// @desc  Submit a task with a file upload
// @route POST /api/submissions/:taskId
// @access Talent (protect middleware only — no role check)
const submitTask = async (req, res) => {
  const { taskId } = req.params;
  const { notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
  return res.status(400).json({
    message: "Invalid Task ID",
  });
}
  try {
    // — any authenticated user can submit for any task
    // — a talent can "submit" an Open or Approved task

    // Build the file URL from multer's saved file
    // with a different PORT or base URL
    const fileUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : req.body.fileUrl || null;
    // — no audit trail of re-submissions
    let submission = await Submission.findOne({ taskId, talentId: req.user._id });

    if (submission) {
      // Overwrite: update in place
      submission.fileUrl = fileUrl;
      submission.notes = notes;
      await submission.save();
    } else {
      submission = await Submission.create({
        taskId,
        talentId: req.user._id,
        fileUrl,
        notes,
      });
    }

    // Update task status to Submitted
    await Task.findByIdAndUpdate(taskId, { status: 'Submitted' });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get submission for a specific task (admin use)
// @route GET /api/submissions/:taskId
// @access Protect only — no admin guard
// @desc  Get submission for a task
// @route GET /api/submissions/:taskId
// @access Admin / Talent
const getSubmission = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.taskId)) {
  return res.status(400).json({
    message: "Invalid Task ID",
  });
}
    let submission;

    // Admin can view every submission
    if (req.user.role === "Admin") {
      submission = await Submission.findOne({
        taskId: req.params.taskId,
      }).populate("talentId", "name email");
    } else {
      // Talent can view only their own submission
      submission = await Submission.findOne({
        taskId: req.params.taskId,
        talentId: req.user._id,
      }).populate("talentId", "name email");
    }

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found or access denied",
      });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc  Get ALL submissions (for Admin review queue)
// @route GET /api/submissions/admin/all
// @access Admin
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate('taskId', 'title dueDate status')
      .populate('talentId', 'name email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Approve or Reject a submission
// @route PUT /api/submissions/:id/review
// @access Admin
const reviewSubmission = async (req, res) => {
  const { reviewStatus } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({
    message: "Invalid Submission ID",
  });
}
    // Validate review status
    if (!["Approved", "Rejected"].includes(reviewStatus)) {
      return res.status(400).json({
        message: "Invalid review status",
      });
    }

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found",
      });
    }

    // Update submission status
    submission.reviewStatus = reviewStatus;
    await submission.save();

    // Update parent task status
    if (reviewStatus === "Approved") {
      await Task.findByIdAndUpdate(submission.taskId, {
        status: "Completed",
      });
    } else {
      await Task.findByIdAndUpdate(submission.taskId, {
        status: "Rejected",
      });
    }

    const updatedSubmission = await Submission.findById(submission._id)
      .populate("taskId", "title status")
      .populate("talentId", "name email");

    res.json(updatedSubmission);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { submitTask, getSubmission, getAllSubmissions, reviewSubmission };
