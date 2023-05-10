const Post = require("../models/post");
const fileHelper = require("../util/file");

exports.addPost = async (req, res, next) => {
  try {
    const {
      user_id,
      title,
      description,
      dateStart,
      dateEnd,
      target,
      content,
      status,
    } = req.body;
    const photos = req.files;
    console.log("photos-->", photos);
    if (Array.isArray(photos) && photos.length > 0) {
      const path_photos = photos.map((item) => item.path);
      const saved_path_photos = path_photos.map((item) =>
        item.replace("public", "https://momo-app-server.onrender.com")
      );
      const newPost = new Post({
        user_id: user_id,
        title: title,
        description: description,
        dateStart: dateStart,
        dateEnd: dateEnd,
        target: target,
        content: content,
        status: status,
        photos: saved_path_photos,
      });
      console.log("newPost-->", newPost);
      const savedPost = await newPost.save();
      res.status(200).json({ message: "add post successful", savedPost });
    } else {
      throw new Error("upload photos unsuccessfully");
    }
    // const photo = req.file;
    // if (photo) {
    //   const path_photo = photo.path.replace("public", "http://localhost:5005");
    //   console.log("path_photo-->", path_photo);
    //   const newPost = new Post({
    //     user_id: user_id,
    //     title: title,
    //     description: description,
    //     dateStart: dateStart,
    //     dateEnd: dateEnd,
    //     target: target,
    //     content: content,
    //     status: status,
    //     photo: path_photo,
    //   });
    //   console.log("newPost-->", newPost);
    //   const savedPost = await newPost.save();
    //   res.status(200).json({ message: "add post successful", savedPost });
    // } else {
    //   throw new Error("upload photos unsuccessfully");
    // }
  } catch (error) {
    console.log(error);
  }
};

exports.getAllPost = async (req, res, next) => {
  try {
    const postList = await Post.find().populate("user_id");
    res.status(200).json(postList);
  } catch (error) {
    console.log(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    console.log("updatePost-->", updatedPost);
    res.status(200).json({ message: "update post successfully", updatedPost });
  } catch (error) {
    console.log(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deletedPost = await Post.findById(id);
    // console.log("deletedPost-->", deletedPost);
    const deleted_photos = deletedPost.photos.map((item) =>
      item.replace("https://momo-app-server.onrender.com", "public")
    );
    // console.log("deleted_photos-->", deleted_photos);
    fileHelper.deleteFile(deleted_photos);
    // const deleted_photo = deletedPost.photo.replace(
    //   "http://localhost:5005",
    //   "public"
    // );
    // // console.log("deleted_photo -->", deleted_photo);
    // fileHelper.deleteFile(deleted_photo);
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "delete post successfully" });
  } catch (error) {
    console.log(error);
  }
};

exports.getPostDetail = async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findById(id);
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
  }
};
