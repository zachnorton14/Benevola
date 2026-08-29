const User = require('../models/User');
const Organization = require('../models/Organization');

const authenticate = async (req, res, next) => {
  const principal = req.session?.principal;
  if (!principal) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { kind, id } = principal;

  if (kind !== "user" && kind !== "org") {
    return res.status(401).json({ message: "Invalid session" });
  }

  const account =
    kind === "user"
      ? await User.findByPk(id)
      : await Organization.findByPk(id);

  if (!account) {
    return res.status(401).json({ message: "Invalid session" });
  }

  /* req.principal is the account that is signed in, and nothing downstream
     reassigns it. req.user / req.org are convenient but not safe to trust for
     authorization: load() overwrites them with whatever record the URL points
     at, so a check placed after load() would be inspecting the target rather
     than the caller. */
  req.principal = account;

  if (kind === "user") req.user = account;
  else req.org = account;

  next();
};

module.exports = authenticate;
