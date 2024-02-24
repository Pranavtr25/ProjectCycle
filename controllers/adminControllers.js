const userModel = require("../model/userModel");

const getAdminLogin = async (req, res) => {
  console.log("Admin");
  if (req.session.admin) {
    res.redirect("/adminHome");
  } else {
    console.log("getPage");
    req.session.adminInvalidCredentials;
    res.render("admin/adminLogin", {
      admin: req.session.admin,
      isAdminInvalid: req.session.adminInvalidCredentials,
    });
    req.session.adminInvalidCredentials = false;
    req.session.save();
  }
};

const validateAdmin = async (req, res) => {
  console.log("1");

  const adminEmail = process.env.adminEmail;
  const adminPassword = process.env.adminPassword;
  let admin = {
    adminEmail,
    adminPassword,
  };
  // console.log(req.body.email)
  // console.log(req.body.password)
  // console.log(adminEmail)
  // console.log(adminPassword)
  if (adminEmail === req.body.email && adminPassword === req.body.password) {
    console.log("admin existing : true");

    req.session.admin = admin;
    res.redirect("/adminHome");
  } else {
    console.log("admin existing false");

    req.session.adminInvalidCredentials = true;
    res.redirect("/adminLogin");
  }
};

const getAdminHome = async (req, res) => {
  if (req.session.admin) {
    res.render("admin/adminDashboard");
  } else {
    console.log("session not work");
    res.redirect("/adminLogin");
  }
};

const getUserManagement = async (req, res) => {
  try {
    console.log("page");
    // let userData = await userModel.find()
    let limit = 10;
    let count;
    let skip;
    let page = Number(req.query.page) || 1;
    totalCount = await userModel.find().estimatedDocumentCount();
    count = totalCount / limit;
    skip = (page - 1) * 10;
    let userData = await userModel.find().skip(skip).limit(limit);
    console.log("2");
    res.render("admin/userManagement", { userData, count });
    console.log("3");
  } catch (error) {
    console.log(`error while getting the usermanagement \n ${error}`);
  }
};

const blockUser = async (req, res) => {
  try {
    console.log("user blocked");
    req.session.isBlock = true;
    req.session.isBlocked = true
    req.session.userData = null;
    req.session.save();
    // console.log(req.session.isBlock);
    await userModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { block: true } }
    );

    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false });
    console.log(`error while blocking the user \n ${error}`);
  }
};

const unBlockUser = async (req, res) => {
  try {
    req.session.isBlock = false;
    req.session.isBlocked = false
    req.session.save();
    console.log(req.session.isBlock);
    await userModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { block: false } }
    );

    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ success: false });
    console.log(`error while unblocking the user \n ${error}`);
  }
};

const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/adminLogin");
  } catch (error) {
    console.error(`error while admin logout \n ${error}`);
  }
};

module.exports = {
  getAdminLogin,
  validateAdmin,
  getAdminHome,
  getUserManagement,
  blockUser,
  unBlockUser,
  adminLogout,
};
