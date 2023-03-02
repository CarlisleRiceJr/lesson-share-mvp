const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Favorite = require("../models/Favorite");


module.exports = {
  getProfile: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      const posts = await Post.find({ user: req.user.id });

      //Sending post data from mongodb and user data to ejs template
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFavorites: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      const posts = await Favorite.find({ user: req.user.id }).populate("post");
      console.log(posts)
      //Sending post data from mongodb and user data to ejs template
      res.render("favorites.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getAllLessons: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      const posts = await Post.find({ user: req.user.id });
      //Sending post data from mongodb and user data to ejs template
      res.render("mylessons.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getLessons: async (req, res) => { 
    console.log(req.user)
    try {
      //Since we have a session each request (req) contains the logged-in users info: req.user
      //console.log(req.user) to see everything
      //Grabbing just the posts of the logged-in user
      const math = await Post.find({ subject: "math" });
      const socialstudies = await Post.find({ subject: "social_studies" });
      const science = await Post.find({ subject: "science" });
      const english = await Post.find({ subject: "english" });
      const specialEducation = await Post.find({ subject: "special_education" });
      const other = await Post.find({ subject: "other" });
      const elementary = await Post.find({ grade: "elementary" });
      const middleschool = await Post.find({ grade: "middle school" });
      const highschool = await Post.find({ grade: "highschool" });

      //Sending post data from mongodb and user data to ejs template
      //second value is the variable declares above
      res.render("lessons.ejs", { user: req.user, math: math, "social_studies": socialstudies, science: science, english: english, "special_education": specialEducation, other:other, elementary: elementary, "middle school" : middleschool, highschool : highschool });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      //id parameter comes from the post routes
      //router.get("/:id", ensureAuth, postsController.getPost);
      //http://localhost:2121/post/631a7f59a3e56acfc7da286f
      //id === 631a7f59a3e56acfc7da286f
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      //media is stored on cloudainary - the above request responds with url to media and the media id that you will need when deleting content 
      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        subject: req.body.subject,
        grade: req.body.grade,
        cloudinaryId: result.public_id,
        description: req.body.description,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  favoritePost: async (req, res) => {
    try {
      
      //media is stored on cloudainary - the above request responds with url to media and the media id that you will need when deleting content 
      await Favorite.create({
        user: req.user.id,
        post: req.params.id,
      });
      console.log("Favorite has been added!");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
