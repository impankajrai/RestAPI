//modules import area
const express = require("express");
const { json } = require("express/lib/response");
const app = express();
const fs = require("fs");

//dummy database import
const db = require("./db.json");

// Just to parse the body "req.body"
app.use(express.json());



///******************************************************************************************** */
// First route start for Create user & Song library

app.post("/", (req, res) => {
  const { Email, Password, Song } = req.body;

  //for checking all details are given or not
  if (!Email || !Password || !Song) {
    res.status(409).json({ "massage": "Please insert all fields" })
  } else {
    let Emailcount = 0;
    let count = 0
    const isSongExist = db.find((data) => {
      if (data.Email === Email) {
        Emailcount++;
        if (data.Password === Password) {
          count++;
          if (data.Song === Song) {
            return true;
          }
        }
      }
    })

    if (count > 0) {   //check user authentication
      // console.log(auth);
      if (isSongExist) {
        res.status(409).json({ message: "Song already exist in your playlist" });
      } else {
        db.push({ Email, Password, Song });
        //Updating json file
        fs.writeFile('./db.json', JSON.stringify(db),
          (err) => {
            if (err) {
              res.status(500).json({ message: err });
            }
            else {
              res.status(200).json({ Email, Password, Song });
            }
          }
        );
      }
    } else {
      // non authanticated users
      if (Emailcount > 0) { //check email is exist or not
        res.status(401).json({ message: "Enter Correct Credantial" });
      } else {
        db.push({ Email, Password, Song });
        //Updating json file
        fs.writeFile('./db.json', JSON.stringify(db),
          (err) => {
            if (err) {
              res.status(500).json({ message: err });
            }
            else {
              res.status(200).json({ "massage": "New User Created", Email, Password, Song });
            }
          }
        );

      }
    }
  }
}) 

///******************************************************************************************** */
// second route start for display the data
app.get("/", (req, res) => {
  const { Email } = req.body;
  const tempDB = [];
  db.filter((data) => {
    if (data.Email === Email) {
      tempDB.push({ Song: data.Song });
    }
  })
  if (tempDB.length) {
    res.status(200).json(tempDB)
  } else res.status(404).json({ "massage": "Data Not Found" })
})

///******************************************************************************************** */
// Third route start for update

app.put("/", (req, res) => {
  const { Email, Password, newPassword } = req.body;
  if (!Email || !Password) {
    res.status(401).json({ massage: "Please insert Email and Password" })
  } else {

    const auth = db.find((data) => {
      if (data.Email === Email) {
        if (data.Password === Password) {
          return true;
        }
      }
    })

    if (auth) {
      if (newPassword) {
        db.find((data) => {   //all password change for corresponding email
          if (data.Email === auth.Email) {
            data.Password = newPassword
          }
        });

        fs.writeFile('./db.json', JSON.stringify(db),
          (err) => {
            if (err) {
              res.status(500).json({ message: err });
            }
            else {
              res.status(200).json({ "massage": "Password Changed successfully" });
            }
          }
        );
      } else {
        res.status(400).json({ "massage": "Enter New Password" });
      }
    } else {
      res.status(401).json({ message: "Enter Correct Credantial" });
    }
  }
})

///******************************************************************************************** */
// fourth route start for Delete
app.delete("/", (req, res) => {
  const { Email, Password, Song } = req.body;

  let countpwd = 0, countSong = 0;
  db.find((data) => {
    if (data.Email === Email) {
      if (data.Password === Password) {
        countpwd++;
        if (data.Song === Song) {
          countSong++;
          let index = db.indexOf(data);
          db.splice(index, 1);
          fs.writeFile('./db.json', JSON.stringify(db), () => {

            res.status(200).json({ "Massage": "Song deleted from your library" })
          });
        }
      }
    }
  })
  if (!countSong) {
  res.status(404).json({"massage":"Song not exist in your playlist"})    
  }
})

app.listen(9000, () => console.log("server is running at port no 9000"))