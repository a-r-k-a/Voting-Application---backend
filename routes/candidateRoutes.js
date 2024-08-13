const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Candidate = require("../models/candidate");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

const checkAdminRole = async (userId) => {
  try {
    const user = User.findById(userId);
    if (user.role === "admin") {
      return true;
    }
  } catch (error) {
    return false;
  }
};

//POST ROUTE TO ADD A CANDIDATE
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin role" });
    }
    const data = req.body; //Assuming request body contains candidate data

    //creating a new candidate
    const newCandidate = new Candidate(data);

    //save the new user to the database
    const response = await newCandidate.save();
    console.log("data saved");
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//PUT ROUTE FOR UPDATING A CANDIDATE
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      res.status(403).json({ message: "user does not have admin role" });
    }
    const candidateId = req.params.candidateId; //get the candidate id from the route parameters
    const updateCandidateData = req.body; //update request body

    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updateCandidateData,
      {
        //function to find the candidate by the id update with the givenn data
        new: true, //
        runValidators: true, //
      }
    );

    if (!response) {
      res.status(404).json({ message: "Candidate bot found" });
    }

    console.log("Candidate data updated");
    res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//DELETE A CANDIDATE
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      res.status(403).json({ mesage: "User does not have admin role" });
    }
    const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate Deleted");
    res.status(200).json({ deleted: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------

//ROUTES FOR VOTING
router.get("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  //user can only vote once
  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    //find the candidate document with the specific candidateId
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin is not allowed" });
    }
    if (user.isVoted) {
      return res.status(403).json({ message: "You have already voted" });
    }

    //update the candidate element to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    //updating the user document
    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: "Vote successfully recorded" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//ROUTE TO GET THE VOTE COUNT
router.get("/vote/count", async (req, res) => {
  try {
    //find all candidates and sort them by votes in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });

    //map the candidates to only return their name and votecount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });

    return res.status(200).json({ voteRecord });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//GET LIST OF ALL THE CANDIDATES WITH ONLY NAME AND PARTY FIELDS
router.get("/", async (req, res) => {
  try {
    //find all the candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id");

    //return the list of cadidates
    res.status(200).json({ candidates });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
