const Lecture = require('../models/Lecture');
const { generateLectureNotes } = require('../services/nlp/generateLectureNotes');

const lectureController = {
  /**
   * @desc    Run the classical NLP pipeline (+ optional Gemini enrichment)
   *          over a lecture transcript
   * @route   POST /api/summarize
   * @access  Private
   */
  summarize: async (req, res) => {
    try {
      const { transcript, subject } = req.body;

      if (!transcript || transcript.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Transcript is required'
        });
      }

      console.log(`Running NLP pipeline on transcript (${transcript.length} characters)...`);

      const { annotations, ...notes } = await generateLectureNotes(transcript, subject);

      console.log(`NLP pipeline complete (enrichment: ${notes.enrichment})`);

      res.status(200).json({
        success: true,
        ...notes,
        annotations
      });

    } catch (error) {
      console.error('Summarization error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to summarize transcript'
      });
    }
  },

  /**
   * @desc    Create new lecture (stores both raw transcript + AI notes)
   * @route   POST /api/lectures
   * @access  Private
   */
  createLecture: async (req, res) => {
    try {
      const {
        title,
        subject,
        rawTranscript,
        transcript,
        summary,
        detailedNotes,
        keyPoints,
        definitions,
        examTopics,
        sentiment,
        entities,
        topics,
        readabilityScore,
        flashcards,
        entitySpans,
        keyTermSpans,
        enrichment,
        duration,
        category,
        tags
      } = req.body;

      if (!title || !transcript || !summary) {
        return res.status(400).json({
          success: false,
          error: 'Title, transcript, and summary are required'
        });
      }

      const lecture = await Lecture.create({
        user: req.user.id,
        title: title.trim(),
        subject: subject?.trim() || '',
        rawTranscript: rawTranscript || transcript, // fallback to transcript if raw not provided
        transcript,
        summary,
        detailedNotes: detailedNotes || [],
        keyPoints: keyPoints || [],
        definitions: definitions || [],
        examTopics: examTopics || [],
        sentiment: sentiment || 'neutral',
        entities: entities || [],
        topics: topics || [],
        readabilityScore: readabilityScore || null,
        flashcards: flashcards || [],
        entitySpans: entitySpans || [],
        keyTermSpans: keyTermSpans || [],
        enrichment: enrichment || 'none',
        duration: duration || 0,
        category: category || 'Other',
        tags: tags || []
      });

      console.log(`Lecture created: ${lecture.title} (User: ${req.user.email})`);

      res.status(201).json({
        success: true,
        lecture
      });

    } catch (error) {
      console.error('Create lecture error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create lecture'
      });
    }
  },

  /**
   * @desc    Get all lectures
   * @route   GET /api/lectures
   * @access  Private
   */
  getAllLectures: async (req, res) => {
    try {
      const { category, tag } = req.query;

      let filter = { user: req.user.id };
      if (category) filter.category = category;
      if (tag) filter.tags = tag;

      const lectures = await Lecture.find(filter)
        .sort({ date: -1 })
        .select('-__v');

      console.log(`Retrieved ${lectures.length} lectures for user: ${req.user.email}`);

      res.status(200).json({
        success: true,
        count: lectures.length,
        lectures
      });

    } catch (error) {
      console.error('Get lectures error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get lectures'
      });
    }
  },

  /**
   * @desc    Get single lecture
   * @route   GET /api/lectures/:id
   * @access  Private
   */
  getLecture: async (req, res) => {
    try {
      const lecture = await Lecture.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!lecture) {
        return res.status(404).json({
          success: false,
          error: 'Lecture not found or you do not have access'
        });
      }

      console.log(`Retrieved lecture: ${lecture.title} (User: ${req.user.email})`);

      res.status(200).json({
        success: true,
        lecture
      });

    } catch (error) {
      console.error('Get lecture error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get lecture'
      });
    }
  },

  /**
   * @desc    Update lecture
   * @route   PUT /api/lectures/:id
   * @access  Private
   */
  updateLecture: async (req, res) => {
    try {
      let lecture = await Lecture.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!lecture) {
        return res.status(404).json({
          success: false,
          error: 'Lecture not found or you do not have access'
        });
      }

      lecture = await Lecture.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      console.log(`Updated lecture: ${lecture.title} (User: ${req.user.email})`);

      res.status(200).json({
        success: true,
        lecture
      });

    } catch (error) {
      console.error('Update lecture error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update lecture'
      });
    }
  },

  /**
   * @desc    Delete lecture
   * @route   DELETE /api/lectures/:id
   * @access  Private
   */
  deleteLecture: async (req, res) => {
    try {
      const lecture = await Lecture.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!lecture) {
        return res.status(404).json({
          success: false,
          error: 'Lecture not found or you do not have access'
        });
      }

      await lecture.deleteOne();

      console.log(`Deleted lecture: ${lecture.title} (User: ${req.user.email})`);

      res.status(200).json({
        success: true,
        message: 'Lecture deleted successfully',
        data: {}
      });

    } catch (error) {
      console.error('Delete lecture error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete lecture'
      });
    }
  },

  /**
   * @desc    Get all categories and tags
   * @route   GET /api/lectures/stats/categories-tags
   * @access  Private
   */
  getCategoriesAndTags: async (req, res) => {
    try {
      const userFilter = { user: req.user.id };

      const categories = await Lecture.distinct('category', userFilter);
      const allTags = await Lecture.distinct('tags', userFilter);

      const categoryStats = await Promise.all(
        categories.map(async (cat) => ({
          name: cat,
          count: await Lecture.countDocuments({ ...userFilter, category: cat })
        }))
      );

      const tagStats = await Promise.all(
        allTags.map(async (tag) => ({
          name: tag,
          count: await Lecture.countDocuments({ ...userFilter, tags: tag })
        }))
      );

      res.status(200).json({
        success: true,
        categories: categoryStats,
        tags: tagStats
      });

    } catch (error) {
      console.error('Get categories/tags error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get categories and tags'
      });
    }
  }
};

module.exports = lectureController;